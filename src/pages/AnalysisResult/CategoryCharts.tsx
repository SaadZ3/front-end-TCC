import { useId } from 'react';
import Icon from '../../components/Icon';
import { number } from '../../services/analyses';
import type { CategoryScore } from './dashboardData';

function wrapLabel(label: string) {
  const lines: string[] = [];
  for (const word of label.split(' ')) {
    if (!lines.length || `${lines[lines.length - 1]} ${word}`.length > 17) lines.push(word);
    else lines[lines.length - 1] += ` ${word}`;
  }
  return lines;
}

function Radar({ categories }: { categories: CategoryScore[] }) {
  const titleId = useId();
  const descriptionId = useId();
  const scored = categories.filter(category => category.score !== null);
  const radius = 104, cx = 200, cy = 163;
  const point = (index: number, value: number, r = radius) => {
    const angle = index * Math.PI * 2 / scored.length - Math.PI / 2;
    return [cx + Math.cos(angle) * r * value / 3, cy + Math.sin(angle) * r * value / 3];
  };
  const polygon = (level: number) => scored.map((_, index) => point(index, level).join(',')).join(' ');
  if (scored.length < 3) return <div className="radar-wrap"><p className="result-footnote">O gráfico de radar precisa de pelo menos três categorias com nota disponível.</p></div>;
  return <div className="radar-wrap"><svg className="radar-chart" viewBox="0 0 400 326" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
    <title id={titleId}>Perfil da política — notas de 0 a 3</title>
    <desc id={descriptionId}>{scored.map(category => `${category.title}: ${category.score} de 3`).join('; ')}. Categorias sem nota não são representadas.</desc>
    {[1, 2, 3].map(level => <polygon key={level} points={polygon(level)} fill="none" stroke="#dce6f2" strokeWidth=".85" />)}
    {scored.map((category, index) => {
      const [x, y] = point(index, 3);
      const [labelX, labelY] = point(index, 3, 143);
      const lines = wrapLabel(category.title);
      return <g key={category.label}>
        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e2eaf4" strokeWidth=".85" />
        <text x={labelX} y={labelY - (lines.length - 1) * 6} textAnchor={Math.abs(labelX - cx) < 5 ? 'middle' : labelX > cx ? 'start' : 'end'}>
          {lines.map((line, lineIndex) => <tspan key={lineIndex} x={labelX} dy={lineIndex ? 12 : 0}>{line}</tspan>)}
        </text>
      </g>;
    })}
    <polygon points={scored.map((category, index) => point(index, category.score!).join(',')).join(' ')} fill="#16a085" fillOpacity=".16" stroke="#087858" strokeWidth="1.65" />
    {[0, 1, 2, 3].map(level => <text key={level} x={cx + 6} y={cy - radius * level / 3 + 3} style={{ fontSize: 9 }}>{level}</text>)}
    {scored.map((category, index) => {
      const [x, y] = point(index, category.score!);
      return <circle key={category.label} cx={x} cy={y} r="2.8" fill="#087858" stroke="white" strokeWidth="1.2"><title>{category.title}: {category.score} / 3</title></circle>;
    })}
  </svg></div>;
}

export default function CategoryCharts({ categories, selected, onSelect }: {
  categories: CategoryScore[]; selected: string; onSelect: (category: string) => void;
}) {
  return <div className="chart-grid">
    <section className="result-panel chart-panel" aria-labelledby="category-chart-title">
      <div className="panel-heading"><h2 id="category-chart-title"><Icon name="chart" size={15} />Nota por categoria</h2><p>Compare as notas das categorias avaliadas nesta política.</p></div>
      <div className="bar-chart">
        <div className="bar-scale" aria-hidden="true"><div><span>0</span><span>1</span><span>2</span><span>3</span></div></div>
        {categories.map(category => <button key={category.label} className="category-bar" aria-pressed={selected === category.label}
          aria-label={`Filtrar ${category.title}: ${category.score === null ? 'sem nota' : `${number(category.score)} de 3`}`}
          onClick={() => onSelect(selected === category.label ? 'all' : category.label)}>
          <span className="bar-title">{category.title}</span><span className="bar-track" aria-hidden="true"><span className="bar-fill" style={{ width: `${(category.score ?? 0) / 3 * 100}%` }} /></span>
          <span className="bar-value">{category.score === null ? '—' : number(category.score)}</span>
        </button>)}
      </div>
      <p className="chart-note">Escala de 0 a 3 · Traço indica categoria sem nota emitida.</p>
    </section>
    <section className="result-panel chart-panel" aria-labelledby="radar-title">
      <div className="panel-heading"><h2 id="radar-title">Perfil da política</h2><p>Gráfico de teia com as mesmas notas por categoria.</p></div>
      <Radar categories={categories} />
      <div className="radar-legend"><span>Nota por categoria</span><span>Máximo: 3</span></div>
    </section>
  </div>;
}
