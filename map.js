import DrawLineChart from "./DrawLineChart.js"


const margin = {left: 50, top: 20, bottom: 20, right: 20}; // the margins of the chart
let width = window.innerWidth; // the width of the svg
let height = window.innerHeight; // the height of the svg
let data;

let countryCodes = [];
let countryName = [];
let genres = [];
let score = [];
let colors = [];

let genreInconnu = [];

let countryGenreInconnu = [];
let numbersInconnu = [];

let genreOfCountryInconnu = [];

let svg = d3.select("body").append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)




let map = async (init) => {

    const geojson = await d3.json("./world-countries-no-antartica.json");

    const projection = d3.geoNaturalEarth1()
        .scale(1)
        .translate([0, 0]);

    const path = d3.geoPath()
        .pointRadius(2)
        .projection(projection);

    const cGroup = svg.append("g");


    var b = path.bounds(geojson),
        s = .80 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    svg
        .append('defs')
        .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', '#000000')
        .attr('stroke-width', 1);

    projection
        .scale(s)
        .translate(t);
    cGroup.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", d => "code" + d.id)
        .attr("class", "country")
        .attr('fill', 'url(#diagonalHatch)');


    // Le traitement du CSV est réalisé ici
    await locationInfo(init);
    addCircleForInconnu();






}
map(true);

function addTooltip() {
    var tooltip = svg.append("g") // Group for the whole tooltip
        .attr("id", "tooltip")
        .style("display", "none");

    tooltip.append("polyline") // The rectangle containing the text, it is 210px width and 60 height
        .attr("points", "0,0 210,0 210,60 0,60 0,0")
        .style("fill", "#222b1d")
        .style("stroke", "black")
        .style("opacity", "0.9")
        .style("stroke-width", "1")
        .style("padding", "1em");

    tooltip.append("line") // A line inserted between country name and score
        .attr("x1", 40)
        .attr("y1", 25)
        .attr("x2", 160)
        .attr("y2", 25)
        .style("stroke", "#929292")
        .style("stroke-width", "0.5")
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
        .style("fill", "#c1d3b8")
        .style("font-weight", "bold");

    return tooltip;
}

let parseRowCount = (d) => {
    d.count = +d.count;
    return d;
}

function colorMap() {
    var tooltip = addTooltip();

    countryCodes.forEach(code => {

        let index = countryCodes.indexOf(code)
        let s = score[index]
        let color = colors[index]
        var countryPath = d3.select("#code" + code);
        countryPath
            .attr("scorecolor", s)
            .style("fill", color)
            .on("mouseover", function () {
                countryPath.style("opacity",0.8);
                countryPath.style("stroke", "black")
                tooltip.style("display", null);
                tooltip.select('#tooltip-country')
                    .text(countryName[index]);
                tooltip.select('#tooltip-score')
                    .text(genres[index] + ' : ' + s + (countryGenreInconnu.includes(code) ? " Inconnu : " + numbersInconnu[countryGenreInconnu.indexOf(code)] : ""))

            })
            .on("mouseout", function () {
                countryPath.style("opacity",1);
                countryPath.style("stroke", "none")
                tooltip.style("display", "none")
            })
            .on("mousemove", function (event) {
                var mouse = d3.pointer(event);
                tooltip.attr("transform", "translate(" + mouse[0] + "," + (mouse[1] - 75) + ")");
            })
            .on('click', function () {
                let d = data.find(d => d.countryCode===code)

                let drawLineChart = new DrawLineChart(svg);
                drawLineChart.genreParAnnee(true, code,d.countryName);
                d3.select("body")
                    .insert("button","svg")
                    .attr('type', "button")
                    .attr('id', 'buttonRetour')
                    .text("Retour à la carte")
                    .style("margin-left","1rem")
                    .on('click', function () {
                        d3.select("#buttonList").remove();
                        d3.select("#buttonRetour").remove();
                        d3.select("#menu").remove();
                        d3.select("#title").remove();
                        svg.remove();
                        svg = d3.select("body").append("svg")
                            .attr('width', width + margin.left + margin.right)
                            .attr('height', height + margin.top + margin.bottom)
                        map(false);
                    });


            })
    });
}


function getAllMaxWithoutInconnu(data) {
    data.forEach(d => {
        if (d.countryCode === "Inconnu") {
            genreOfCountryInconnu.push(d)
        } else {
            if (!countryName.includes(d.countryName) && d.genre !== "Inconnu") {
                countryCodes.push(d.countryCode)
                if (genres.includes(d.genre)) colors.push(colors[genres.indexOf(d.genre)]);
                else colors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase())
                genres.push(d.genre)
                score.push(d.count)
                countryName.push(d.countryName)



            } else {
                if (d.genre === "Inconnu") {
                    genreInconnu.push(d)
                } else {
                    let index = countryName.indexOf(d.countryName)
                    if (score[index] < d.count) {
                        countryCodes[index] = d.countryCode
                        if (genres.includes(d.genre)) colors[index] = colors[genres.indexOf(d.genre)]
                        else colors[index] ='#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
                        genres[index] = d.genre
                        score[index] = d.count

                    }


                }
            }
        }



    })

}

function tooltipInconnu() {
    var tooltip = svg.append("g") // Group for the whole tooltip
        .attr("id", "tooltip")
        .style("display", "none");

    tooltip.append("polyline") // The rectangle containing the text, it is 210px width and 60 height
        .attr("points", "0,0 950,0 950,560 ,0 560,0")//.attr("points", "0,0 950,0 950,560 ,20 560,0")
        .style("fill", "#222b1d")
        .style("stroke", "black")
        .style("opacity", "0.9")
        .style("stroke-width", "1")
        .style("padding", "1em");

    tooltip.append("line") // A line inserted between country name and score
        .attr("x1", 40)
        .attr("y1", 25)
        .attr("x2", 920)
        .attr("y2", 25)
        .style("stroke", "#929292")
        .style("stroke-width", "0.5")
        .attr("transform", "translate(0, 5)");

    var text = tooltip.append("text") // Text that will contain all tspan (used for multilines)
        .style("font-size", "13px")
        .style("fill", "#c1d3b8")
        .attr("transform", "translate(0, 20)");

    text.append("tspan") // Country name udpated by its id
        .attr("x", 470) // ie, tooltip width / 2
        .attr("y", 0)
        .attr("id", "tooltip-country")
        .attr("text-anchor", "middle")
        .style("font-weight", "600")
        .style("font-size", "16px");
    var y = 0;
    var x = 0;
    genreOfCountryInconnu.forEach(d => {
        text.append("tspan") // Fixed text
            .attr("x", 105 + x) // ie, tooltip width / 2
            .attr("y", 30 + y)
            .attr("text-anchor", "middle")
            .style("fill", "929292")
            .text(d.genre + " : " + d.count);
        y += 15;
        if (y > 500) {
            x += 150;
            y = 0;
        }
    })


    return tooltip;
}

function addCircleForInconnu() {
    svg.append('circle')
        .attr('id', "circle")
        .attr('cx', 50)
        .attr('cy', 100)
        .attr('r', 20)
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2')
    var tooltip = tooltipInconnu();

    var circle = d3.select("#circle");
    circle
        .on("mouseover", function () {
            circle.style("fill", "#9966cc");
            tooltip.style("display", null);
            tooltip.select('#tooltip-country')
                .text("Inconnu Island");

        })
        .on("mouseout", function () {
            circle.style("fill", '#69a3b2')
            tooltip.style("display", "none")
        })
        .on("mousemove", function (event) {
            var mouse = d3.pointer(event);
            tooltip.attr("transform", "translate(" + (mouse[0]+15) + "," + (mouse[1] - 75) + ")");
        })
        .on('click', function () {
            let drawLineChart = new DrawLineChart(svg);
            drawLineChart.genreParAnnee(true, "Inconnu","Inconnu Island");
            d3.select("body")
                .insert("button","svg")
                .attr('type', "button")
                .attr('id', 'buttonRetour')
                .text("Retour à la carte")
                .on('click', function () {
                    d3.select("#buttonList").remove();
                    d3.select("#buttonRetour").remove();
                    d3.select("#menu").remove();
                    d3.select("#title").remove();
                    svg.remove();
                    svg = d3.select("body").append("svg")
                        .attr('width', width + margin.left + margin.right)
                        .attr('height', height + margin.top + margin.bottom)
                    map(false);
                });
        })
    ;


}



let locationInfo = async (init) => {
    data = await d3.csv("locationInfo.csv", parseRowCount);
    if (init) {
        getAllMaxWithoutInconnu(data);
        addCountryWithGenreInconnu();
    }
    colorMap();
};


function addCountryWithGenreInconnu() {
    var countryWithNoGenre = [];
    genreInconnu.forEach(d => {
        if (countryCodes.includes(d.countryCode)) {
            countryGenreInconnu.push(d.countryCode)
            numbersInconnu.push(d.count)
        } else {
            countryWithNoGenre.push(d);
        }

    })

    var color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()
    countryWithNoGenre.forEach(d => {
            countryName.push(d.countryName)
            countryCodes.push(d.countryCode);
            score.push(d.count);
            genres.push(d.genre);
            if (colors.length <= data.length) colors.push(color);

        }
    )
}

