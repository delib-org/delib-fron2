function showEntityPanel(){
   if(document.getElementById("entitiesPanel") == null){
      appendTemplate("#EntitiesPanel-tmpl",{}, "#container");
      console.log("starting panle")
   }
   $("#entitiesPanel").hide().slideDown(400);
   renderTemplate("#hideEntityPanel-tmpl",{}, "footer");
}

function hideEntityPanel(){
   renderTemplate("#showEntityPanel-tmpl",{}, "footer");
   $("#entitiesPanel").slideUp(400);
}
