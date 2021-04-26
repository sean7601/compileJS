var compiler = {};

$("#clickableStartUpload").on("click", function () {
    compiler.getFile("uploadInput");
});
$("#uploadInput").on("change",function(e){
    compiler.loadoldDatabaseUpload(e);
})

compiler.getFile = function (buttonToClick) {
    document.getElementById(buttonToClick).click();
};

compiler.files = {}
compiler.files.names = []
compiler.files.html = []
compiler.files.js = []
compiler.files.css = []
compiler.files.extensions = []
compiler.files.fileNames = []
compiler.files.unsorted = []
compiler.output = "";
compiler.loadoldDatabaseUpload = function (event) {
    compiler.data = [];
    if (event.target.files && event.target.files.length) {
        compiler.uploadedFiles = event.target.files
    }

    compiler.readFiles()

};

compiler.readFiles = function(){
    for(var i=0;i<compiler.uploadedFiles.length;i++){
        compiler.readFile(compiler.uploadedFiles[i])
    }
    compiler.checkForCompletion()
}

compiler.checkForCompletion = function(){
    setTimeout(function(){
        if(compiler.uploadedFiles.length == compiler.files.extensions.length){
            
            compiler.setDownloadUI();
        }
        else{
            compiler.checkForCompletion()
        }
    },1000)
}

compiler.checkForIssues = function(){
    var unique = compiler.files.names.filter(compiler.onlyUnique);
    if(unique.length != compiler.files.names.length){
        alert("You cannot have two files with the same name, regardless of folder location")
    }
    if(compiler.files.html.length > 1){
        alert("You can only have 1 html file")
    }
    if(compiler.files.html.length == 0){
        alert("You need at least 1 html file")
    }
}

compiler.onlyUnique = function(value, index, self) {
    return self.indexOf(value) === index;
}

compiler.setDownloadUI = function(){
    $("#content").html("<button style='width:44%;margin-right:3%;margin-left:3%' class='btn btn.lg btn-secondary tooltiper m-3' onclick='compiler.findScriptTags()'>Download App</button>")
}

compiler.readFile = function (file) {
    var ext = file.name.split(".").pop().toLowerCase();
    var name = file.name;
    var shortName = file.name;
    shortName.split(".").pop()
    var fileReader = new FileReader()

    fileReader.readAsText(file);
    fileReader.onload = () => {
        var obj = fileReader.result
        var results = {content:obj,ext:ext,name:name,shortName:name};

        compiler.files.extensions.push(ext)
        if(!compiler.files[ext]){
            compiler.files[ext] = []
        }
        compiler.files[ext].push(results)
        compiler.files.names.push(name)
    };
};


compiler.findScriptTags = function(){
    compiler.checkForIssues();
    var content = compiler.files.html[0].content;
    //var html = content.replaceAll("\r","")
    //html = html.replaceAll(/\\"/g, '"').split("\n")
    var html = content.split(`\n`)
    for(var i=0;i<html.length;i++){
        var line = html[i];
        //check if this line contains a script tag
        if(line.indexOf(`<script`) != -1 && line.indexOf('src=') != -1 && line.indexOf(`</script>`) != -1){
            //find the appropriate bit of javascript
            for(var ii=0;ii<compiler.files.js.length;ii++){
                var jsFile = compiler.files.js[ii];
                if(line.indexOf(jsFile.name) != -1){
                    html[i] = "<script>"+jsFile.content+"</script>";
                }
            }
        }

        else if(line.indexOf("<link") != -1 && line.indexOf('rel=') != -1 && line.indexOf("href=") != -1){
            //find the appropriate bit of css
            for(var ii=0;ii<compiler.files.css.length;ii++){
                var cssFile = compiler.files.css[ii];
                if(line.indexOf(cssFile.name) != -1){
                    html[i] = "<style>"+cssFile.content+"</style>";
                }
            }
        }

    }
    compiler.output = html;

    var blob = new Blob([html.join(`\n`)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "newFile.html");
}