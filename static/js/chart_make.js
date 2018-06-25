queue()	
	.defer(d3.json, "/weather/getDataList")
	.defer(d3.csv, "/static/KoreaPosition.csv")
    .await(makeGraphs);
	
var airKoreaData = "";
var stateList = "";
var width = 550, 
    height = 570,
	svg,
	centered,
	mcentered,
	map,
	points,
	path,
	projection;

function makeGraphs(error, projectsJson,csvJson) {
	 
  
     var colorScale = d3.scale.linear() 
         .range(['green','red']) // or use hex values 
         .domain([40, 60]); 
		 
		 /*.style("fill", function(d) {
                         var returnColor;
                         if (d === 30) { returnColor = "green";
                         } else if (d === 70) { returnColor = "purple";
                         } else if (d === 110) { returnColor = "red"; }
                         return returnColor;
                       });
*/
  
     svg = d3.select("#kor-chart").append("svg") 
         .attr("width", width) 
         .attr("height", height); 
  
     map = svg.append("g").attr("id", "map")
     points = svg.append("g").attr("id", "cities"); 
  
     projection = d3.geo.mercator() 
         .center([128, 36.4]) 
         .scale(5000) 
         .translate([width/2.0, height/2.55]); 
  
     path = d3.geo.path().projection(projection); 
  
     var quantize = d3.scale.quantize() 
         .domain([0, 12234630]) // FIXME: automate 
         .range(d3.range(9).map(function(i) { return " p" + i; })); 
  
     var popById = d3.map(); 
    
     var radius = d3.scale.sqrt() 
         .domain([0, 90]) 
         .range([0, 40]); 
		 
	
     var legend = svg.append("g") 
         .attr("class", "legend") 
         .attr("transform", "translate(" + (width/2 + 100) + "," + (height - 20) + ")") 
         .selectAll("g") 
         .data([10, 20, 30,50, 70, 90]) 
         .enter().append("g"); 
  
     legend.append("circle") 
         .attr("cy", function(d) { return -radius(d); }) 
         .attr("r", radius); 
  
     legend.append("text") 
         .attr("y", function(d) { return -2 * radius(d); }) 
         .attr("dy", "1.3em") 
         .text(d3.format(".1s")); 
		 
	  airKoreaData = projectsJson;

 	  var line = svg.append("g")
       	  line.append('text')
					 .attr('class', 'barsEndlineText')
					 .attr('text-anchor', 'middle')
					 .attr("x", width-100)
					 .attr("y", 20)
					 .text( "기준시간 : " +airKoreaData.list[0]["dataTime"]);
		 

     // add map 
     d3.json("/static/js/korea3.json", function(error, data) { 
       map.selectAll('path') 
		 .data(topojson.feature(data, data.objects["provinces-geo"]).features)
         .enter().append('path') 
           .attr('class', function(d) { console.log(); return 'province c' + d.properties.code }) 
           .attr('d', path) 
		   .on("click", mclicked)
     }); 
	
	
     // add circles 
     d3.csv("/static/KoreaPosition.csv", function(data) { 
         points.selectAll("circle") 
           .data(data) 
           .enter().append("circle") 
             .attr("cx", function(d) { return projection([d.lon, d.lat])[0]; }) 
             .attr("cy", function(d) { return projection([d.lon, d.lat])[1]; }) 
             .attr("r", function(d) { return 3 * Math.sqrt(parseInt(airKoreaData.list[0][d.name])); }) 
             .style("fill", function(d) { return colorScale(airKoreaData.list[0][d.name]); })	     
		     .on("click", clicked)
			
		//모든 text 요소 반환 후 새로운 텍스트 2개 추가
		 var text1= points.selectAll("text") 
           .data(data) 
           .enter();
		   
		 text1.append("text") 
             .attr("x", function(d) { return projection([d.lon, d.lat])[0]; }) 
             .attr("y", function(d) { return projection([d.lon, d.lat])[1] + 5; }) 
             .text(function(d) { return d.name_kor })
			 .on("click", clicked)
			 
		 text1.append("text") 
             .attr("x", function(d) { return projection([d.lon, d.lat])[0]; }) 
             .attr("y", function(d) { return projection([d.lon, d.lat])[1] + 15; }) 
             .text(function(d) { return airKoreaData.list[0][d.name] })
			 .on("click", clicked)
  
     });
	 
	stateList = csvJson;	
	  
	//Clean projectsJson data
	/*var airProjectsJson = projectsJson;*/
	var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
	
	drawAllProvince();
	
}
 

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
	  
	
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
	mcentered = null;
  }
  
  //Circle등 path가 없는 경우 projection으로 처리
  if(isNaN(x))
  {
	  x = projection([d.lon, d.lat])[0];
	  y = projection([d.lon, d.lat])[1];
  }
  
 //연동형 시도/이름
 var sido_name= stateList.find(function(element) {
				
			  if(typeof d.properties == "undefined")
				return element.name===d.name;
			  else
				return element.name===d.properties.name_eng;
			
			}).name_service;
 
 
	  
  //-- 버튼클릭시 뒷배경
  map.selectAll("path")
      .classed("active", centered && function(d) {
      //console.log("t " + d.properties.name_eng.toLowerCase() + ' ' + centered.name.toLowerCase())
      return (d.properties.name_eng.toLowerCase().search(centered.name.toLowerCase()) > -1); });

  map.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
    

  points.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  points.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
	  


   if (d && centered !== d) 
   {
	    $('#chart1Title').html('PM10 정보 그래프(이전 24시간 평균 데이터)');  
		drawAllProvince();
   }else
   {
	   $('#chart1Title').html('지역별 PM10 분포도');
	   d3.json( "/weather/getCtprvnDataList/"+sido_name, function(error, data) { 
	 
				var ndx = crossfilter(data.list);
		
				cityChartDimension = ndx.dimension(function (d) {
					return d.cityName;
				})
				dataGroup = cityChartDimension.group().reduceSum(function (d) {
					return d.pm10Value;
				})

				
				//console.log(cityChartDimension);
				//PM10 차트의 값을 기준으로 Grouping
				var timeChart = dc.rowChart("#time-chart");
				//console.log(dateDimGroup);
				timeChart
					.width(600)
					.height(570)
					.dimension(cityChartDimension)
					.group(dataGroup)
					.xAxis().ticks(4);
					
					
				dc.renderAll();
	 });
   }

}

function mclicked(d) {
  var x, y, k;
    //console.log(d.properties.name)
  if (d && mcentered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    mcentered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    mcentered = null;
    centered = null;
  }

  map.selectAll("path")
      .classed("active", mcentered && function(d) { return d === mcentered; });

  map.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
    
  points.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  points.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
	  
  if (d && centered !== d) 
   {
	    $('#chart1Title').html('PM10 정보 그래프(이전 24시간 평균 데이터)');  
		drawAllProvince();
   }else
   {
	   $('#chart1Title').html('지역별 PM10 분포도');
	   d3.json( "/weather/getCtprvnDataList/"+sido_name, function(error, data) { 
	 
				var ndx = crossfilter(data.list);
		
				cityChartDimension = ndx.dimension(function (d) {
					return d.cityName;
				})
				dataGroup = cityChartDimension.group().reduceSum(function (d) {
					return d.pm10Value;
				})

				
				//console.log(cityChartDimension);
				//PM10 차트의 값을 기준으로 Grouping
				var timeChart = dc.rowChart("#time-chart");
				//console.log(dateDimGroup);
				timeChart
					.width(600)
					.height(570)
					.dimension(cityChartDimension)
					.group(dataGroup)
					.xAxis().ticks(4);
					
					
				dc.renderAll();
	 });
   }
	  
}

//모든 시군의 데이터 보여주기
function drawAllProvince()
{
	
	 d3.json( "/weather/getDataList", function(error, data) { 
			//Create a Crossfilter instance
			var ndx = crossfilter(data.list);
			
			//20시간 평균값을 가공하여 시,도별 데이터에 입력
			stateList.forEach(function(d) {
				d.averageValue = ndx.groupAll().reduceSum(function(fact) { return fact[d.name];}).value()/data.list.length;
			  });	
			
			//시,도별 데이터를 crossFilter에 입력
			var ndxStates = crossfilter(stateList);
			
			//time 차트의 값을 기준으로 Grouping
			var timeChartDimension= ndxStates.dimension(function(d) { return d.name_kor });
			var dateDimGroup =timeChartDimension.group().reduceSum(function(d) {return +d.averageValue;});
			var timeChart = dc.rowChart("#time-chart");
			//console.log(dateDimGroup);
			timeChart
				.width(600)
				.height(570)
				.dimension(timeChartDimension)
				.group(dateDimGroup)
				.xAxis().ticks(4);
				
				
			dc.renderAll();
	 });
}
