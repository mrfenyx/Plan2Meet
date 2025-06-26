import React, { useState } from "react";

export default function ClickGrid() {
  const [selected, setSelected] = useState([]);
  const grid = Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 7 }, (_, col) => `${row},${col}`)
  );
  const toggle = slot =>
    setSelected(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );

  return (
    <div>
      <table style={{ borderCollapse: "collapse" }}>
        <tbody>
          {grid.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map(slot => (
                <td key={slot}>
                  <div
                    onClick={() => toggle(slot)}
                    style={{
                      width: 32,
                      height: 32,
                      background: selected.includes(slot)
                        ? "limegreen"
                        : "#eee",
                      border: "1px solid #bbb",
                      userSelect: "none",
                      textAlign: "center",
                      cursor: "pointer"
                    }}
                  >
                    {selected.includes(slot) ? "✔" : ""}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
