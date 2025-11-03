import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PieResults({ candidates }) {
  const data = (candidates || []).map(c => ({
    name: `${c.number}. ${c.name}`,
    value: c.count ?? 0,
  }));

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc475",
    "#ff918c",
    "#ff7a81",
    "#d6bbff",
    "#a0ddda",
    "#ffbb78",
    "#ff80ab",
    "#aaa6ee",
    "#b3ffb3",
    "#ffb399",
    "#ff7979",
  ];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" data={data} cx="50%" cy="50%" outerRadius={110} label isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
