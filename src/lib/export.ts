/**
 * Utilitaires pour exporter des données dans différents formats.
 */
export function exportToCsv(filename: string, data: any[]) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporte les données au format Excel (.xlsx) - Stub
 */
export function exportToExcel(filename: string, _data: any[]) {
    alert(`Export Excel (${filename}.xlsx) en cours de préparation...`);
}

