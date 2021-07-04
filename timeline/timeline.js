nameArray = [
    "History of the World",
    "History of China",
    "AT&T",
]
linkArray = [
    "https://docs.google.com/spreadsheet/pub?key=0ApxlRZJfRaj9dGFZSW92Z3hVOEtVTWgwVkpRazVaSEE&output=html",
    "https://docs.google.com/spreadsheet/pub?key=0ApxlRZJfRaj9dHBvX3BXMEd4UXF0RHRLbHNMQy05bkE&output=html",
    "https://docs.google.com/spreadsheet/pub?key=0ApxlRZJfRaj9dDhsLThnX0k2bmdYamd5eVNuZ05nZlE&output=html",
]

timeline = document.getElementById("timeline");

p = document.createElement("p");
p.innerHTML = "Timeline";
timeline.appendChild(p);

ul = document.createElement("ul");
timeline.appendChild(ul);

for (i = 0; i < nameArray.length; i++) {
    li = document.createElement("li");
    li.innerHTML = '<a href="timeline/timeline.html?' + linkArray[i] + '">' + nameArray[i] + '</a>';
    ul.appendChild(li);
}