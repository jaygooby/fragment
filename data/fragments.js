(function (){
var id_list=[];
var addressable_nodes=[];
var color;
var last_element=null;
var doc;
function clean_last_element(){
    if(last_element){
        last_element.style.backgroundColor=color;
        last_element.removeEventListener("click",copy_url,true);
    }
}
function cleanup(){
    clean_last_element();
    for(var i=0;i<addressable_nodes.length;i++){
        addressable_nodes[i].removeEventListener("mouseover",taint,true);
    }
}
function copy_url(e){
    var url=""+doc.location;
    var idx=url.indexOf("#");
    if(idx>0){
        url=url.slice(0,idx);
    }
    var identifier=last_element.id;
    if(id_list.indexOf(identifier)==-1)identifier=last_element.name;
    url+="#"+identifier;
    self.port.emit("URL",url);
    cleanup();
    e.preventDefault();
    e.stopPropagation();
}
function taint(e){
    clean_last_element();
    last_element=e.currentTarget;
    color=e.currentTarget.style.backgroundColor;
    e.currentTarget.style.backgroundColor="red";
    e.currentTarget.addEventListener("click",copy_url,true);
}
function append_unique(id){
    if(id=="")return 1;
    if(id_list.indexOf(id)==-1){
        id_list.push(id);
        return 0;
    }
    return 1;
}
function traverse(node){
    var rv=append_unique(node.id);
    if(rv==0){
        addressable_nodes.push(node);
    }
    for(var i=0;i<node.children.length;i++){
        traverse(node.children[i]);
    }
}
function attach_event_handlers(){
    for(var i=0;i<addressable_nodes.length;++i){
        addressable_nodes[i].addEventListener("mouseover",taint,true);
    }
}
function traverse_children(node){
    for(var i=0;i<node.children.length;i++){
        traverse(node.children[i]);
    }
}
function process_anchors(anchors){
    for(var i=0;i<anchors.length;i++){
        var rv=append_unique(anchors[i].name);
        if(rv==0){
            addressable_nodes.push(anchors[i]);
        }
    }
}
function start(){
    doc=document;
    if(!doc)return;
    traverse_children(doc.body);
    process_anchors(doc.anchors);
    attach_event_handlers();
}
start();
self.port.on("bail", function(){
    cleanup();
});
})();
