import { useEffect, useRef, useState } from 'react'
import './App.css'
import * as d3 from 'd3'

function TreeMap( {dataset} ){
  const svgContainer = useRef(null)

  const [currentJSON, setCurrentJSON] = useState();

  useEffect(() => {
    fetch(dataset.url)
    .then(response => response.json())
    .then(data => setCurrentJSON(data))
  }, [dataset])

  useEffect(() => {
    if(!currentJSON) return;

    //clear canvas
    d3.select(svgContainer.current)
    .selectAll('*')
    .remove();
    d3.select('#main')
    .select('#tooltip')
    .remove();

    const width = 1000;
    const height = 600;

    const color = d3.scaleOrdinal(currentJSON.children.map(d => d.name), d3.schemePastel2);


    //tooltip
    const tooltip = d3.select('#main')
    .append('div')
    .attr('id','tooltip')


    //compute the layout
    const root = d3.treemap()
    .size([width, height])
    .padding(1)
    .round(true)
    (d3.hierarchy(currentJSON)
    .sum(d => d.value)
    .sort((a,b) => b.value - a.value));

    //create svg container
    const svg = d3.select(svgContainer.current)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('font-size', 10)

    //add a cell for each leaf of the hierarchy
    const leaf = svg.selectAll('g')
    .data(root.leaves())
    .join('g')
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    //append a color rectangle
    leaf.append('rect')
    .attr('class','tile')
    .attr('data-name', d => d.data.name)
    .attr('data-category', d => d.data.category)
    .attr('data-value', d => d.data.value)
    .attr('fill', d => {
      while (d.depth > 1) d = d.parent; 
      return color(d.data.name); })
    .attr('fill-opacity', 1)
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .on('mouseover', (event, d) => {
      tooltip.style('opacity', 1)
      .style('left', event.pageX + 20 + 'px')
      .style('top', event.pageY - 40 + 'px')
      .html(`<p>Name: ${d.data.name}</p><br><p>Category: ${d.data.category}</p><br><p>Value: ${d.data.value}</p>`)
    })
    .on('mouseout', () => {
      tooltip.style('opacity',0)
      .html('')
    })
    .append('rect')
    .attr('clip-path','url(#clip)')

    //clip path
    leaf.append('clipPath')
    .attr('id','clip')
    .append('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => d.y1 - d.y0)
    .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

    //append text title
    leaf.append('text')
    .attr('class','tile-text')
    .selectAll('tspan')
    .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
    .enter()
    .append('tspan')
    .attr('x', 3)
    .attr('y', (d,i) => 13 + i * 10)
    .text(d => d)

    const legendSVG = d3.select(svgContainer.current)
    .append('svg')
    .attr('id','legend')
    .attr('width', 600)
    .attr('height', 400)


  }, [currentJSON])

  return (
    <>
      <h1 id='title'>{dataset.title}</h1>
      <h2 id='description'>{dataset.description}</h2>
      <div ref={svgContainer} id='svg-container'></div>
    </>
  )
}

function App() {

  const DATASETS = {
    videoGames : {
      title : 'Video Game Sales',
      description : 'Top 100 Most Sold Video Games Grouped by Platform',
      url : 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
    },
    movies : {
      title : 'Movie Sales',
      description : 'Top 100 Highest Grossing Movies Grouped By Genre',
      url : 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
    }, 
    kickstarter : {
      title : 'Kickstarter Pledges',
      description : 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
      url : 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
    }
  }

  const [currentDataset, setCurrentDataset] = useState(DATASETS.videoGames)

  function handleClick(event, datasetChoice){
    event.preventDefault();
    setCurrentDataset(datasetChoice);
  }

  return (
    <div id='main'>
      <div id="link-container">
        <a onClick={e => handleClick(e, DATASETS.videoGames)} href="">Video Game Data Set</a>
        <p> | </p>
        <a onClick={e => handleClick(e, DATASETS.movies)} href="">Movies Data Set</a>
        <p> | </p>
        <a onClick={e => handleClick(e, DATASETS.kickstarter)} href="">Kickstarter Data Set</a>
      </div>


      <TreeMap dataset = {currentDataset} />
    </div>
  )
}

export default App
