
let moviesData, h, w, margin, marginSvg, windowBig, quantile, svg, root, nodes, bg, colorsAll, legend;

if(window.innerWidth > 600){
  h = 500;
  w = 1050;
  margin = 50;
  marginTop = 50;
  marginSvg = 100;
  windowBig = true;
} else {
  h = 1200;
  w = window.innerWidth - 40;
  margin = 20;
  marginTop = 20;
  marginSvg = 40;
  windowBig = false;
}

bg = "#463f3a";
colorsAll = ["#0099ff", "#ff9900", "#00a362", "#9900ff", "#ff6b6b", "#edb458", "#e6aace"];

d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json")
  .then( data => init(data));

const init = (data) => {
  moviesData = data;
  
  createContainer();
  createHeading();
  createScaleColor();
  createMap();
  createSvg();
  createText();
  createLegend();
}

const getMovieKey = (d) => {
  var name = d.data.name.split(" ").map(element => element.toLowerCase());
  var category = d.data.category.split(" ").map(element => element.toLowerCase());
  var result = category.concat(name)
  .map(element => element.replace(/[.,\/#!$%\^&\*;:{}=\-_`'~()”“"…]/g, ""))
  .filter(Boolean)
  .join("-");
  return result;
}

const createContainer = () => {
  container = d3.select("body")
    .append("div")
    .attr("id", "container")
}

const createHeading = () => {
  const heading = d3.select("#container")
    .append("div")
    .attr("class", "heading");
  
  heading
    .append("h1")
    .attr("id", "title")
    .html("Películas")
  
  heading
    .append("p")
    .attr("id", "description")
    .html("Top 95 películas más vistas, ordenadas por género")
}

const createMap = () => {
  root = d3.hierarchy(moviesData).sum(d => d.value);
  
  d3.treemap()
    .size([w, h])
    .paddingInner(1)
    (root);
}

const createScaleColor = () => {
  ordinal = d3.scaleOrdinal()
    .domain(moviesData.children.map(d => d.name))
    .range(colorsAll)
}

const createLegend = () => {
  var transX = windowBig ? 15*7 : (15*7)/w;
  var yAux = 0;
  
    const getX = (valDefault, d, i) => {
    var x;
    if(windowBig) x = valDefault;
    else{
      if(i > moviesData.children.length / 2){
        x = margin + 8*15;
      } else {
        x = margin;
      }
    }
    return x;
  }
  
  const getY = (valDefault, d, i) => {
    var y;
    if(windowBig) y = valDefault;
    else{
      if(i > moviesData.children.length / 2){
        y = (yAux * 30) + 20;
        yAux++;
      }
      else y = (i * 30) + 20;
    }
    return y;
  }
  
  legend = d3.select("#container")
    .append("svg")
    .attr("id", "legend")
    .attr("width", w)
    .attr("height", windowBig ? 40 : 160)    
  
  legend
    .selectAll("rect")
    .data(moviesData.children)
    .join("rect")
    .attr("class", "legend-item")
    .attr("x", (d,i) => getX((i*15*8),d,i))
    .attr("y", (d,i) => getY(0,d,i))
    .attr("width", 22)
    .attr("height", 22)
    .attr("fill", d => ordinal(d.name))
    .attr("transform", `translate(${transX}, 0)`)
  
   yAux = 0;
  
  legend
    .selectAll("g rect")
    .data(moviesData.children)
    .join("rect")
    .attr("x", (d,i) => getX((i * 15*8), d,i))
    .attr("y", (d,i) => (windowBig ? 0 : 22) + getY(22, d,i))
    .attr("width", 7.5 * 15)
    .attr("height", 2)
    .attr("fill", d => ordinal(d.name))
    .attr("transform", `translate(${transX}, 0)`)
  
   yAux = 0;
  
  legend
    .selectAll("text")
    .data(moviesData.children)
    .join("text")
    // .attr("x", (d,i) => (i * 15*8) + 30)
    .attr("x", (d,i) => getX((i*15*8),d,i) + 30)
    .attr("y", (d,i) => (windowBig ? 0 : 10) + getY(10,d,i))
    .text(d => d.name)
    .attr("fill", "#fff")
    .attr("transform", `translate(${transX}, 6)`)
}

const createSvg = () => {
  svg = d3.select("#container")
    .append("svg")
    .attr("width", w + marginSvg)
    .attr("height", h + marginSvg)
}

const mouseOver = (e, d) => {
  d3.select(`.tile-${getMovieKey(d)}`)
    .transition().duration(20).style("filter", "brightness(1.2)");
  createTooltip(e, d);
}

const mouseOut = (d) => {
  d3.select(`.tile-${getMovieKey(d)}`)
    .transition().duration(100).style("filter", "brightness(1)");
  hiddenLegend();
}

const createText = () => {
  const splitWords = (string, x) => {
    const sentence = string.split(" ").map((element, i) => {
      var dy = i === 0 ? "0" : "1.2em";
      return `<tspan dy=${dy} x=${x + 5}>${element}</tspan>`;
    });
    return sentence.join("");
  }

  root.leaves()
    .map( d => {

      svg
        .append("rect")
        .attr("class", `tile tile-${getMovieKey(d)}`)
        .attr("x", d.x0)
        .attr("y", d.y0)
        .attr("width", d.x1 - d.x0)
        .attr("height", d.y1 - d.y0)
        .attr("data-name", d.data.name)
        .attr("data-category", d.data.category)
        .attr("data-value", d.data.value)
        .style("fill", ordinal(d.data.category))
        .attr("transform", `translate(${margin}, ${marginTop})`)
        .on("mousemove", (e) => {
          mouseOver(e, d);
        })
        .on("mouseout", () => {
          mouseOut(d);
        });
    
      svg
        .append("text")
        .attr("class", `text text-${getMovieKey(d)}`)
        .attr("height", 30)
        .attr("x", d.x0)
        .attr("y", d.y0 + 15)
        .style("width", "30px")
        .style("font-size", "10px")
        .html(`${splitWords(d.data.name, d.x0)}`)
        .attr("transform", `translate(${margin}, ${marginTop})`)
        .style("cursor", "default")
        .on("mousemove", (e) => {
          mouseOver(e, d);
        })
        .on("mouseout", () => {
          mouseOut(d);
        });
  });

  svg
    .append("rect")
    .attr("x", w)
    .attr("y", 0)
    .attr("width", margin)
    .attr("height", h)
    .attr("fill", bg)
    .attr("transform", `translate(${margin}, ${marginTop})`);
  
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", h)
    .attr("width", w)
    .attr("height", margin)
    .attr("fill", bg)
    .attr("transform", `translate(${margin}, ${marginTop})`)
}


const createTooltip = (e, d) => { 
  const getInfoStructure = (d, xTooltip) => {
    var info = (
      `<tspan dy="0em" x=${xTooltip + 5}>Nombre: ${d.data.name}</tspan>
      <tspan dy="1.2em" x=${xTooltip + 5}>Categoría: ${d.data.category}</tspan>
      <tspan dy="1.2em" x=${xTooltip + 5}>Tasa: ${d.data.value}</tspan>`
    )
    return info;
  }
    
  const getWidth = (d) => {
    return d.data.name.length > 8 
      ? (d.data.name.length * 5) + 70
      : 120;
  }
  
  var xTooltip, yTooltip;
  var xText, yText;
  
  if(windowBig){
    if(e.offsetX > 830){
      xTooltip = e.offsetX - getWidth(d) - 40;
    } else {
      xTooltip = e.offsetX + 40;
    }
    xText = e.offsetX + 40;
    yTooltip = e.offsetY - 50;
    yText = e.offsetY - 37.5;
  } else {
    if(getWidth(d) < 250 && e.offsetX > 35){
      if(e.offsetX > 250)
        xTooltip = e.offsetX - getWidth(d);
      else 
        xTooltip = e.offsetX - 30
    } else 
      xTooltip = margin + 5;
    xText = xTooltip;
     
    if(e.offsetY < 155){
      yTooltip = e.offsetY + 107.5;
      yText = e.offsetY + 120;
    } else {
      yTooltip = e.offsetY - 150;
      yText = e.offsetY - 137.5;
    }
  }
  
  d3.selectAll(".tooltip")
    .remove();
  d3.selectAll(".tooltip-text")
    .remove();
  
  var tooltip = svg
    .append("rect")
    .attr("id", "tooltip")
    .attr("class", "tooltip")
    .attr("data-value", d.data.value)
    .attr("x", xTooltip)
    .attr("y", yTooltip)
    .attr("width", getWidth(d))
    .attr("height", 45)
    .attr("rx", 7)
    .attr("ry", 7)
    .attr("fill", "#ba181bdd")
    .attr("opacity", 1)
  
  svg
    .append("text")
    .attr("class", "tooltip-text")
    .attr("x", xText)
    .attr("y", yText)
    .style("font-size", "11px")
    .style("fill", "#fff")
    .html(getInfoStructure(d, xTooltip))
};

const hiddenLegend = () => {
  d3.selectAll(".tooltip").attr("opacity", 0)
  d3.selectAll(".tooltip").remove();
  d3.selectAll(".tooltip-text").attr("opacity", 0)
  d3.selectAll(".tooltip-text").remove();
};
