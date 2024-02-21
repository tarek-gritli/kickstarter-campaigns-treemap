import * as d3 from "d3";
import { kickstarterCategories, dataset } from "../data";

function createTitleAndDescription() {
  const title = d3
    .select("main")
    .append("h1")
    .attr("id", "title")
    .text(dataset.title);
  const description = d3
    .select("main")
    .append("h3")
    .attr("id", "description")
    .text(dataset.description);
}
function createSvgAndTooltip() {
  const svg = d3.select("main").append("svg").attr("class", "treemap");
  const tooltip = d3.select("main").append("div").attr("id", "tooltip");
  return { svg, tooltip };
}
async function fetchData(svg, tooltip) {
  try {
    const dataResponse = await fetch(dataset.url);
    if (!dataResponse.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await dataResponse.json();
    renderTreemap(data, svg, tooltip);
  } catch (error) {
    document.querySelector("main").innerHTML("<h1>Failed to fetch data");
  }
}
function renderTreemap(data, svg, tooltip) {
  const root = d3.hierarchy(data).sum((d) => d.value);
  d3.treemap().size([1000, 600]).paddingInner(1)(root);
  const handleMouseOver = (d) => {
    return tooltip
      .style("opacity", 0.75)
      .style("top", d3.event.pageY + "px")
      .style("left", d3.event.pageX + 10 + "px")
      .html(
        "Name: " +
          d.data.name +
          "<br>Category: " +
          d.data.category +
          "<br>Value: " +
          d.data.value
      )
      .attr("data-value", d.data.value);
  };
  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("fill", (d) => {
      const category = d.data.category;
      const obj = kickstarterCategories.find((obj) => obj.category == category);
      return obj ? obj.color : "gray";
    })
    .on("mouseover", handleMouseOver)
    .on("mouseout", (d) => {
      tooltip.style("opacity", 0);
    });
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", (d) => d.x0 + 5)
    .attr("y", (d) => d.y0 + 20)
    .text((d) => d.data.name)
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .attr("fill", "black");
}

function initializeTreemap() {
  createTitleAndDescription();
  const { svg, tooltip } = createSvgAndTooltip();
  fetchData(svg, tooltip);
}

initializeTreemap();
