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

  const segments = [
    { label: '', value: 1 },
  ];

  const arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius * 0.5);

  const pie = d3.pie()
    .sort(null)
    .value((d) => d.value)
    .startAngle(-Math.PI / 2)
    .endAngle(Math.PI / 2);

  const gradient = svg.append('linearGradient').attr('id', 'gradient');

  gradient.append('stop').attr('stop-color', '#F23B63').attr('offset', '0%');
  gradient.append('stop').attr('stop-color', '#FF9F1C').attr('offset', '25%');
  gradient.append('stop').attr('stop-color', '#FAD946').attr('offset', '50%');
  gradient.append('stop').attr('stop-color', '#A2ED66').attr('offset', '75%');

  svg.selectAll('path')
    .data(pie(segments)).enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', 'url(#gradient)');

  svg.selectAll('text')
    .data(pie(segments)).enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', (d) => `translate(${arc.centroid(d)})`)
    .text((d) => d.data.label);

  const median = d3.median(items, (item) => item.score);

  const needles = svg.append('g').classed('needles', true);
  const needlePath = `M0 8 L${-radius} 0 L0 -8 Z`;

  const needleElse = needles.append('line')
    .attr('x1', '0')
    .attr('y1', '0')
    .attr('x2', `${-radius}`)
    .attr('y2', '0')
    .attr('stroke', '#ffffff')
    .attr('stroke-width', '4px')
    .attr('stroke-dasharray', '4 1');

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
