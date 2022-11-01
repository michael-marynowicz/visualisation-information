import DrawLineChart from "./DrawLineChart.js"



const margin = {left: 50, top: 20, bottom: 20, right: 20}; // the margins of the chart
let width = window.innerWidth; // the width of the svg
let height = window.innerHeight; // the height of the svg
let data;



let svg = d3.select("body").append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)


const projection = d3.geoNaturalEarth1()
    .scale(1)
    .translate([0, 0]);

const path = d3.geoPath()
    .pointRadius(2)
    .projection(projection);

const cGroup = svg.append("g");

var promises = [];
promises.push(d3.json("./world-countries-no-antartica.json"));


Promise.all(promises).then(function(values) {
    const geojson = values[0];


    var b  = path.bounds(geojson),
        s = .80 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    cGroup.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", d => "code" + d.id)
        .attr("class", "country");

    // Le traitement du CSV est réalisé ici
});

function addTooltip() {
    var tooltip = svg.append("g") // Group for the whole tooltip
        .attr("id", "tooltip")
        .style("display", "none");

    tooltip.append("polyline") // The rectangle containing the text, it is 210px width and 60 height
        .attr("points","0,0 210,0 210,60 0,60 0,0")
        .style("fill", "#222b1d")
        .style("stroke","black")
        .style("opacity","0.9")
        .style("stroke-width","1")
        .style("padding", "1em");

    tooltip.append("line") // A line inserted between country name and score
        .attr("x1", 40)
        .attr("y1", 25)
        .attr("x2", 160)
        .attr("y2", 25)
        .style("stroke","#929292")
        .style("stroke-width","0.5")
        .attr("transform", "translate(0, 5)");

    var text = tooltip.append("text") // Text that will contain all tspan (used for multilines)
        .style("font-size", "13px")
        .style("fill", "#c1d3b8")
        .attr("transform", "translate(0, 20)");

    text.append("tspan") // Country name udpated by its id
        .attr("x", 105) // ie, tooltip width / 2
        .attr("y", 0)
        .attr("id", "tooltip-country")
        .attr("text-anchor", "middle")
        .style("font-weight", "600")
        .style("font-size", "16px");

    text.append("tspan") // Fixed text
        .attr("x", 105) // ie, tooltip width / 2
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("fill", "929292")
        .text(" ");

    text.append("tspan") // Score udpated by its id
        .attr("id", "tooltip-score")
        .style("fill","#c1d3b8")
        .style("font-weight", "bold");

    return tooltip;
}

let parseRowCount = (d) => {
    d.count = +d.count;
    return d;
}

let locationInfo = async () => {
    data = await d3.csv("locationInfo.csv",parseRowCount);
    getAllMaxWithoutInconnu(data);
    var tooltip = addTooltip();
    country.forEach(code => {
        let index = country.indexOf(code)
        let s = score[index]
        let color = colors[index]
        var countryPath = d3.select("#code" + code);
        countryPath
            .attr("scorecolor", s)
            .style("fill", color)
            .on("mouseover", function() {
                countryPath.style("fill", "#9966cc");
                tooltip.style("display", null);
                tooltip.select('#tooltip-country')
                    .text(countryName[index]);
                tooltip.select('#tooltip-score')
                    .text(genres[index]+' : '+s);
            })
            .on("mouseout", function() {
                countryPath.style("fill", color)
                tooltip.style("display", "none")
            })
            .on("mousemove", function(event) {
                var mouse = d3.pointer(event);
                tooltip.attr("transform", "translate(" + mouse[0] + "," + (mouse[1] - 75) + ")");
            })
            .on('click',function(){
                let drawLineChart = new DrawLineChart(svg);
                drawLineChart.genreParAnnee(true)
                //genreParAnnee(true)
            })
        ;
    });
}
locationInfo();

let country = [];
let countryName = [];
let genres = [];
let score = [];
let colors = []
function getAllMax(data){
    data.forEach(d => {
        if (!country.includes(d.countryCode)){
            country.push(d.countryCode)
            genres.push(d.genre)
            score.push(d.count)
            colors.push('#'+Math.floor(Math.random()*16777215).toString(16));

        }
        else {
            let index = country.indexOf(d.countryCode)
            if (score[index]<d.count){
                country[index] = d.countryCode
                genres[index] = d.genre
                score[index] = d.count
            }
        }
    })
}

function getAllMaxWithoutInconnu(data){
    data.forEach(d => {
        if (!country.includes(d.countryCode) && d.genre !== "Inconnu"){
            country.push(d.countryCode)
            colors.push(genres.includes(d.genre) ? colors[genres.indexOf(d.genre)] : '#'+Math.floor(Math.random()*16777215).toString(16))
            genres.push(d.genre)
            score.push(d.count)
            countryName.push(d.countryName)
            //colors.push('#'+Math.floor(Math.random()*16777215).toString(16));


        }
        else {
            let index = country.indexOf(d.countryCode)
            if (score[index]<d.count && d.genre !== "Inconnu"){
                country[index] = d.countryCode
                genres[index] = d.genre
                score[index] = d.count
            }
        }
    })
}