"""SQL Security Validator - Prevents SQL Injection and enforces read-only access"""

import re
from typing import Tuple, List, Set
import sqlparse
from sqlparse.sql import IdentifierList, Identifier, Where
from sqlparse.tokens import Keyword, DML, Punctuation
from loguru import logger


class SQLSecurityError(Exception):
    """Raised when SQL validation fails"""
    pass


class SQLValidator:
    """Validates and sanitizes SQL queries for security using sqlparse"""
    
    # Forbidden SQL keywords (write operations)
    FORBIDDEN_KEYWORDS = {
        "INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "CREATE",
        "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE",
        "MERGE", "CALL", "BULK", "OPENROWSET", "OPENDATASOURCE",
        "XP_", "SP_"
    }
    
    def __init__(self, allowed_tables: List[str], max_rows: int = 1000):
        self.allowed_tables = {t.upper() for t in allowed_tables}
        self.max_rows = max_rows
        logger.info(f"SQLValidator initialized with {len(allowed_tables)} allowed tables (sqlparse version)")
    
    def validate(self, sql: str) -> Tuple[bool, str]:
        """
        Validate SQL query for security.
        
        Returns:
            Tuple of (is_valid, error_message or sanitized_sql)
        """
        if not sql or not sql.strip():
            return False, "Empty SQL query"
        
        try:
            # Parse the SQL
            parsed = sqlparse.parse(sql)
            if not parsed:
                return False, "Failed to parse SQL"
            
            # We only allow one statement
            if len(parsed) > 1:
                logger.warning("Blocked query with multiple statements")
                return False, "Multiple SQL statements are not allowed"
            
            stmt = parsed[0]
            
            # 1. Must be a DML query and start with SELECT
            if stmt.get_type() != 'SELECT':
                logger.warning(f"Blocked non-SELECT query: {stmt.get_type()}")
                return False, "Only SELECT queries are allowed"
            
            # 2. Check for forbidden keywords in tokens
            for token in stmt.flatten():
                if token.ttype in Keyword or token.ttype is DML:
                    value = token.value.upper()
                    if value in self.FORBIDDEN_KEYWORDS:
                        logger.warning(f"Blocked query with forbidden keyword '{value}'")
                        return False, f"Forbidden keyword detected: {value}"
                
                # Check for comments
                if token.ttype in sqlparse.tokens.Comment:
                    logger.warning("Blocked query with comments")
                    return False, "SQL comments are not allowed"
            
            # 3. Extract and validate table names
            tables = self._extract_tables(stmt)
            invalid_tables = tables - self.allowed_tables
            if invalid_tables:
                logger.warning(f"Blocked query with unauthorized tables: {invalid_tables}")
                return False, f"Unauthorized tables: {', '.join(invalid_tables)}"
            
            # 4. Add TOP clause if not present (Enforce max rows)
            sanitized_sql = self._ensure_top_clause(sql)
            
            logger.debug(f"Query validated successfully using AST")
            return True, sanitized_sql
            
        except Exception as e:
            logger.error(f"SQL Validation error: {e}")
            return False, f"SQL Validation error: {str(e)}"
    
    def _extract_tables(self, stmt) -> Set[str]:
        """Extract table names from sqlparse statement"""
        tables = set()
        from_seen = False
        
        for token in stmt.tokens:
            if from_seen:
                if isinstance(token, IdentifierList):
                    for identifier in token.get_identifiers():
                        tables.add(self._clean_table_name(identifier))
                elif isinstance(token, Identifier):
                    tables.add(self._clean_table_name(token))
                elif token.ttype is Keyword and token.value.upper() in ["JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN"]:
                    # Keep looking for next identifier
                    continue
                elif token.ttype is Keyword:
                    # End of FROM clause tables
                    from_seen = False
            
            if token.ttype is Keyword and token.value.upper() == "FROM":
                from_seen = True
            
            # Also catch JOINs specifically if they are not part of IdentifierList
            if token.ttype is Keyword and "JOIN" in token.value.upper():
                # The next identifier should be the table
                pass # Handled by Identifier check in main loop
                
        # Fallback for complex JOINs
        if not tables:
            # Simple regex fallback if AST extraction is too shallow for nested joins
            # But let's try to be thorough with AST first.
            # Identifier extraction also works for JOINs if we iterate
            for token in stmt.flatten():
                if isinstance(token.parent, Identifier):
                    # Check if grandparent is a FROM or JOIN sibling
                    p = token.parent
                    tables.add(self._clean_table_name(p))
                    
        return {t for t in tables if t}
    
    def _clean_table_name(self, identifier: Identifier) -> str:
        """Clean table name from identifier"""
        name = identifier.get_real_name()
        if name:
            # Remove brackets and quotes
            name = name.replace("[", "").replace("]", "").replace('"', '').replace("'", "")
            return name.upper()
        return ""

    def _ensure_top_clause(self, sql: str) -> str:
        """Add/Modify TOP clause to limit results (using regex for final injection)"""
        sql_upper = sql.upper()
        
        # Check if TOP already exists
        if "TOP" in sql_upper:
            # Extract existing TOP value and enforce max
            top_match = re.search(r"TOP\s+(\d+)", sql_upper)
            if top_match:
                existing_top = int(top_match.group(1))
                if existing_top > self.max_rows:
                    # Replace with max_rows
                    sql = re.sub(
                        r"TOP\s+\d+",
                        f"TOP {self.max_rows}",
                        sql,
                        flags=re.IGNORECASE
                    )
            return sql
        
        # Add TOP clause after SELECT
        sql = re.sub(
            r"^(SELECT\s+)(DISTINCT\s+)?",
            rf"\1\2TOP {self.max_rows} ",
            sql,
            flags=re.IGNORECASE
        )
        
        return sql


def create_validator(allowed_tables: List[str], max_rows: int = 1000) -> SQLValidator:
    """Factory function to create a SQL validator"""
    return SQLValidator(allowed_tables, max_rows)
