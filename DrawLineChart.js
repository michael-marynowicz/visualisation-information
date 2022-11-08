
export default class DrawLineChart {

    constructor(svg) {
        this.svg = svg;
        this.svg.style("padding-left","4rem")
            .style("margin-left","1rem");

        this.margin = {left: 50, top: 20, bottom: 20, right: 20}; // the margins of the chart

        this.width = window.innerWidth - 500; // the width of the svg

        this.height = window.innerHeight - 304; // the height of the svg

        this.genreToPrint = [];

        this.colors = [];

        this.fivemax=[];

        this.div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }


    findMinAndMax(data){
        let min=data[0]["publicationDate"]
        let max=data[0]["publicationDate"]
        data.forEach(d =>{
            if(d.publicationDate<min){
                min=d.publicationDate
            }
            if(d.publicationDate>max){
                max=d.publicationDate
            }
        })
        return [min,max];
    }


    groupByGenreAndYear(data){
        let dataGroup = Array.from(data);
        dataGroup.forEach(d=>{
                let genre = d.genre;
                dataGroup.forEach(g =>{
                    if (g.genre!==genre && g.count===d.count && g.publicationDate===d.publicationDate){
                        genre+=" "+g.genre;
                        dataGroup.splice(dataGroup.indexOf(g),1);
                    }
                })
                d.genreGroup = genre


        })
        return dataGroup

    }

    applyColor(marks, d) {
        const index = marks.indexOf(d)
        d.genre = this.data[index]["genre"]
        return this.colors[this.fivemax.indexOf(d.genre)]
    }

    find5max(data) {
        let maxIndex = [];
        let maxValue = [0, 0, 0, 0, 0];

        let total = [];
        let genres = Array.from(this.allGenre);

        data.forEach(d=>{
            let index = genres.indexOf(d.genre);
            total[index] = !total[index] ? d.count : total[index] + d.count;

        })
        for (let i = 0; i < genres.length; i++) {
            let min = Math.min.apply(Math, maxValue)
            if (total[i] > min) {
                maxIndex[maxValue.indexOf(min)] = genres[i];
                maxValue[maxValue.indexOf(min)] = total[i];

            }
        }
        return maxIndex;
    }

    classement = async () => {
        let data = await d3.csv("classement.csv");
    }

    stickyheaddsadaer(genre, box) {
        if (box.checked) {
            this.genreToPrint.push(genre);
        } else {
            let index = this.genreToPrint.indexOf(genre)
            this.genreToPrint.splice(index, 1);

        }

        if (this.genreToPrint.length !== 0) {
            this.data = this.copieData.filter(d => this.genreToPrint.includes(d["genre"]))

        } else {
            this.data = [];
        }

        this.svg.selectAll("*").remove();

        this.drawLineChart(this.data);
    }


    createCheckBox(genre){
        this.colors.push('#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase())
        this.fivemax.push(genre)
        d3.select("#List")
            .append("div")
            .attr("id",`checkbox-${genre}`)
        d3.select(`#checkbox-${genre}`)
            .append("input")
            .attr("type","checkbox")
            .attr("name","genre")
            .attr("id",`genre-${genre}`)
            .attr("checked",true)

        d3.select(`#checkbox-${genre}`)
            .append("label")
            .attr("id",`label-${genre}`)
            .attr("for",`genre-${genre}`)
            .text(genre)
    }

    parseRowGenreParAnnee = (d) => {
        if (d.publicationDate==="Inconnu" )d.publicationDate=2020
        else d.publicationDate = +d.publicationDate;
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
                .style("border","rgb(101, 101, 101) 3px ridge")
        }
        const x = d3.scaleLinear()
            .domain([this.minMax[0], this.minMax[1]])
            .range([this.margin.left, this.width - this.margin.right])
        ;


        const y = d3.scaleLinear()
            .domain(d3.extent(data, this.yValue))
            .range([this.height - this.margin.bottom, this.margin.top])
        ;
        const dataGroupBy = this.groupByGenreAndYear(data)

        const marks = dataGroupBy.map(d => ({
            x: x(this.xValue(d)),
            y: y(this.yValue(d)),
        }));

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
                    .style("top", (event.pageY - 20) + "px")
                    .style("opacity", 1)
                    .html(dataGroupBy[marks.indexOf(d)]["genreGroup"]);
            })
            .on("mouseout", () => {
                this.div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
        ;
        let axis =d3.axisBottom(x);
        axis.ticks(10)
            .tickFormat(function(d) {
                if (d===2020) return "Inconnu";
                return d.toString();
            });


        this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(y));

        this.svg.append("text")
            .attr("y", this.height/2)
            .attr("x",-20)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Nombre")
        this.svg.append("text")
            .attr("y", (this.height/2)+20)
            .attr("x",-20)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("d'albums");


        this.svg.append('g')
            .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
            .call(axis);
        this.svg.append("text")
            .attr("transform",
                "translate(" + (this.width/2) + " ," +
                (this.height + this.margin.top ) + ")")
            .style("text-anchor", "middle")
            .text("Date");



    }


    genreParAnnee = async (toMap,countryCode,countryName) => {
        this.data = await d3.csv("genreParAnnee.csv", this.parseRowGenreParAnnee);



        this.allGenre = new Set();
        this.data.map(d => {
            d.genre = d.genre.replace(/\s/g, '-')
            this.allGenre.add(d.genre)
        });
        this.minMax = this.findMinAndMax(this.data)
        this.data = this.data.filter( d => (d.country === countryCode) && this.allGenre.has(d["genre"]));
        this.copieData = Array.from(this.data);
        this.fivemax = this.find5max(this.data);



        d3.select("body")
            .insert("h2","#buttonRetour")
            .attr("id","title")
            .style("text-align","center")
            .text(countryName)

        d3.select("body")
            .insert("div","svg")
            .attr("id","menu");


        d3.select("#menu")
            .append("div")
            .attr("id","buttonList")
        d3.select("#buttonList")
            .append("p")
            .attr('id','genres')
            .text("Selectionner les genres:")
            .style("margin-left","1rem")
        d3.select("#buttonList")
            .append("div")
            .attr('id','List')
            .style("margin-left","1rem")

        Array.from(this.fivemax).forEach((genre) => {
            this.createCheckBox(genre)
            let input = d3.select(`#genre-${genre}`).node();
            this.stickyheaddsadaer(genre, input);
            d3.select(`#genre-${genre}`)
                .on("change",()=>{
                    this.stickyheaddsadaer(genre, input);
                })
        });
        d3.select("#buttonList")
            .append("button")
            .attr('id','clear')
            .attr('type',"submit")
            .style("margin-top","1rem")
            .style("margin-bottom","1rem")
            .style("margin-left","1rem")
            .text("Supprimer la selection")
            .on('click',()=>{
                this.fivemax.forEach((genre) => {
                    let input = d3.select(`#genre-${genre}`).node()
                    input.checked=false;
                    this.data=[];
                    this.genreToPrint=[];
                    this.svg.selectAll("*").remove();
                    this.drawLineChart(this.data);
                })
            })

        d3.select("#buttonList")
            .append('div')
            .attr('class',"text-container")
        d3.select(".text-container")
            .append("input")
            .attr('id','input')
            .attr('type','text')
            .attr('value','')
            .attr('list','programmingLanguages')
            .attr('placeholder','Rechercher un genre')
            .style("margin-bottom","1rem")
            .style("margin-left","1rem")
        d3.select(".text-container")
            .append("button")
            .attr('type',"submit")
            .text("Ajouter un genre")
            .on('click',() =>{
                let genre = document.getElementById('input').value;
                if (this.allGenre.has(genre) && !this.fivemax.includes(genre)){
                    this.createCheckBox(genre)

                    let input = d3.select(`#genre-${genre}`).node();
                    this.stickyheaddsadaer(genre, input);
                    d3.select(`#genre-${genre}`)
                        .on("change",()=>{
                            this.stickyheaddsadaer(genre, input);
                        })
                }
                else{
                    if (genre==="All") {
                        this.allGenre.forEach(d =>
                        {
                            if (!this.fivemax.includes(d)) {
                                this.createCheckBox(d)

                                let input = d3.select(`#genre-${d}`).node();
                                this.stickyheaddsadaer(d, input);
                                d3.select(`#genre-${d}`)
                                    .on("change",()=>{
                                        this.stickyheaddsadaer(d, input);
                                    })

                            }
                        })

                    }
                    else alert("genre not good")
                }
            })
        d3.select(".text-container")
            .append("datalist")
            .attr('id','programmingLanguages')
        d3.select("#programmingLanguages")
            .append("option")
            .attr('value', 'All')
            .text('All')
        this.allGenre.forEach(d=>{
            if (!this.fivemax.includes(d)){
                d3.select("#programmingLanguages")
                    .append("option")
                    .attr('value', d)
                    .text(d)
            }
        })

        this.drawLineChart(this.data,toMap);
    };


}

