"use client";

interface DocsTableProps {
  headers: string[];
  rows: string[][];
}

export function DocsTable({ headers, rows }: DocsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--surface)] border-b border-[var(--border)]">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-mono text-xs uppercase tracking-[0.1em] text-[var(--text-muted)]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`border-b border-[var(--border)] px-4 py-3 ${
                    cellIndex === 0
                      ? "font-mono text-[var(--foreground)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
