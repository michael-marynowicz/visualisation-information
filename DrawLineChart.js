
export default class DrawLineChart {

    constructor(svg) {
        this.svg = svg;

        this.margin = {left: 50, top: 20, bottom: 20, right: 20}; // the margins of the chart

        this.width = window.innerWidth - 500; // the width of the svg

        this.height = window.innerHeight - 200; // the height of the svg

        this.genreToPrint = [];

        this.colors = [];

        this.div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }





    parseRowGenreParAnnee = (d) => {
        d.publicationDate = +d.publicationDate;
        d.count = +d.count;
        return d;
    }


    xValue = (d) => d.publicationDate

    yValue = (d) => d.count

    drawLineChart(data, toMap = false) {
        if (toMap) {
            this.svg.selectAll("*").remove();
            this.svg
                .attr('width', this.width + this.margin.left + this.margin.right)
                .attr('height', this.height + this.margin.top + this.margin.bottom)
        }
        const x = d3.scaleLinear()
            .domain(d3.extent(data, this.xValue))
            .range([this.margin.left, this.width - this.margin.right])
        ;

        const y = d3.scaleLinear()
            .domain(d3.extent(data, this.yValue))
            .range([this.height - this.margin.bottom, this.margin.top])
        ;

        const marks = data.map(d => ({
            x: x(this.xValue(d)),
            y: y(this.yValue(d)),
        }));
//'#'+Math.floor(Math.random()*16777215).toString(16);

        this.svg.selectAll('circle')
            .data(marks)
            .join('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 5)
            .style("fill", d => this.colors.length > 0 ? this.applyColor(marks, d) : "#000000")
            .on("mouseover", (event, d) => {
                this.div.html(d)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("opacity", 1)
                    .html(data[marks.indexOf(d)]["genre"]);
            })
            .on("mouseout", () => {
                this.div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
        ;


        this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(y));

        this.svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(x));


    }

    applyColor(marks, d) {
        const index = marks.indexOf(d)
        d.genre = this.data[index]["genre"]
        return this.colors[this.genreToPrint.indexOf(d.genre)]
    }

    find5max(data) {
        let maxIndex = ["", "", "", "", ""];
        let maxValue = [0, 0, 0, 0, 0];

        data.forEach(d => {
            let min = Math.min.apply(Math, maxValue)
            if (d.count > min && !maxIndex.includes(d.genre)) {
                maxIndex[maxValue.indexOf(min)] = d.genre;
                maxValue[maxValue.indexOf(min)] = d.count;

            }
        });
        return maxIndex;
    }

    classement = async () => {
        let data = await d3.csv("classement.csv");
    }

    stickyheaddsadaer(genre, box) {
        if (box.checked) {
            this.genreToPrint.push(genre);
            this.colors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase())
        } else {
            let index = this.genreToPrint.indexOf(genre)
            this.genreToPrint.splice(index, 1);
            this.colors.splice(index, 1);
        }

        if (this.genreToPrint.length !== 0) {
            this.data = this.copieData.filter(d => this.genreToPrint.includes(d["genre"]))

        } else {
            this.data = this.copieData;
        }
        this.svg.selectAll("*").remove();
        this.drawLineChart(this.data);
    }



    genreParAnnee = async (toMap,countryCode) => {
        this.data = await d3.csv("genreParAnnee.csv", this.parseRowGenreParAnnee);


        this.allGenre = new Set();
        this.data.map(d => {
            d.genre = d.genre.replace(/\s/g, '-')
            this.allGenre.add(d.genre)
        });
        this.data = this.data.filter( d => d.country === countryCode)
        this.copieData = Array.from(this.data);
        this.allGenre = this.find5max(this.data);

        let container = document.createElement("div");
        d3.select("body")
            .append("p")
            .attr('id','List')
            .text("Select genres:")

        Array.from(this.allGenre).forEach((genre) => {
            let input = document.createElement("input");
            input.type = "checkbox";
            input.name = "genre";
            input.id = `genre-${genre}`;

            let label = document.createElement("label");
            label.setAttribute("for", `genre-${genre}`);
            label.appendChild(input);
            label.innerHTML += genre;
            label.onchange = () => {
                input.checked = !input.checked;
                this.stickyheaddsadaer(genre, input);
            };

            container.appendChild(label);
        });

        document.querySelector("#List").appendChild(container);

        this.data = this.data.filter(d => this.allGenre.includes(d["genre"]))

        this.drawLineChart(this.data,toMap);
    };


}

