import * as d3 from 'd3';

const getAngle = (value) => (value * 180) / 100;

const renderGaugeChart = (items, score) => {
  const svg = d3.select('svg');
  const { width } = svg.node().parentNode.getBoundingClientRect();
  const height = ((9 * width) / 16) / 2;
  const radius = Math.min(width, height);

  svg.attr('width', width)
    .attr('height', height)
    .attr('viewBox', `-${width / 2} -${height} ${width} ${height + 10}`);

  const accents = d3.scaleOrdinal().range(['#FEB2B2', '#FAF089', '#9AE6B4']);

  const segments = [
    { label: 'Pícaro', value: 1 },
    { label: 'Gil', value: 1 },
    { label: 'Guardián', value: 1 },
  ];

  const arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius * 0.5);

  const pie = d3.pie()
    .sort(null)
    .value((d) => d.value)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  svg.selectAll('path')
    .data(pie(segments)).enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d) => accents(d.index));

  svg.selectAll('text')
    .data(pie(segments)).enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    .text((d) => d.data.label);

  const median = d3.median(items, (item) => item.score);

  const needles = svg.append('g').classed('needles', true);
  const needlePath = `M0 8 L${-radius} 0 L0 -8 Z`;

  const needleElse = needles.append('path')
    .attr('d', needlePath)
    .attr('fill', '#4A5568');

  const needleSelf = needles.append('path')
    .attr('d', needlePath)
    .attr('fill', '#4A5568');

  needles.append('circle')
    .attr('r', 10)
    .attr('fill', '#A0AEC0')
    .attr('stroke', '#FFFFFF');

  needleElse
    .transition()
    .duration(1000)
    .delay(750)
    .attr('transform', `rotate(${getAngle(median)})`);

  needleSelf
    .transition()
    .duration(1000)
    .delay(500)
    .attr('transform', `rotate(${getAngle(score)})`);
};

export default renderGaugeChart;
