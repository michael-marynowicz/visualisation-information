//d3.select('#d3').text('Hello world!')


/*let location = d3.csv("locationInfo.csv");
let genreParAnnee = d3.csv("genreParAnnee.csv");*/


const margin = {left: 50, top: 20, bottom: 20, right: 20}; // the margins of the chart
const width = window.innerWidth; // the width of the svg
const height = window.innerHeight; // the height of the svg

let svg = d3.select("body").append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

let parseRowGenreParAnnee = (d) => {
    d.publicationDate = +d.publicationDate;
    d.count = +d.count;
    return d;
}

const xValue = (d) => d.publicationDate
const yValue = (d) => d.count

function drawLineChart(data){
    const x = d3.scaleLinear()
        .domain(d3.extent(data, xValue))
        .range([margin.left, width- margin.right-500])
    ;

    const y = d3.scaleLinear()
        .domain(d3.extent(data, yValue))
        .range([height-margin.bottom, margin.top+50])
    ;

    const marks = data.map(d => ({
        x: x(xValue(d)),
        y: y(yValue(d)),
    }));


    svg.selectAll('circle')
        .data(marks)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
    ;

    svg.append('g')
        .attr('transform',`translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append('g')
        .attr('transform',`translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom(x));


}

let classement = async () => {
    let data = await d3.csv("classement.csv");

}
classement();



function stickyheaddsadaer(genre,box){
    console.log(genre)
    if (box.checked){
        console.log(genre)
        genreToPrint.push(genre);
    }
    else {
        let index = genreToPrint.indexOf(genre)
        genreToPrint.splice(index,1);
    }

    if (genreToPrint.length!==0){
        data = copieData.filter(d => genreToPrint.includes(d["genre"]))
        console.log(data.filter(d => d["genre"]))
    }
    else{
        data = copieData;
    }
    svg.remove();
    svg = d3.select("body").append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    drawLineChart(data);

}

let genreToPrint = [];
let data;
let copieData;

let genreParAnnee = async () => {
    data = await d3.csv("genreParAnnee2.csv", parseRowGenreParAnnee);
    copieData = Array.from(data);

    allGenre = new Set();
    data.map(d => {
        d.genre = d.genre.replace(/\s/g, '-')
        allGenre.add(d.genre)
    });


    const html = Array.from(allGenre).map(genre => `<label for="genre-${genre}">
                <input type="checkbox" name="genre" id="genre-${genre}" onchange=stickyheaddsadaer(\"${genre}",this)>${genre}
            </label>`
    ).join(' ');


    document.querySelector("#List").innerHTML += `<div>${html}</div>`


    data = data.filter(d => allGenre.has(d["genre"]))

    drawLineChart(data);

};
genreParAnnee();




