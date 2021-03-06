
ldc.catTree = function (pre_cb, post_cb) {

    pre_cb("ldc.catTree");

    var AJAX_URL = "../server/get_categories3.php";
    var SELECTOR = "#cat-tree";
    var IS_INIT = false;

    function storeCategories(data, textStatus) {
        ldc.data.cats = data;
        constructTree();
    }

    function getCategories() {
        $.getJSON(AJAX_URL, storeCategories);
    }


    function constructTree()  {

        var jDiv = $(SELECTOR);


        function display_cat_r(cat, html) {
            html += '<li id="cat_'+cat.id+'" cat_id="'+cat.id+'"><a href="#"><ins>&nbsp;</ins>'+cat.name+'</a>';
            var children = cat.children;
            if (children.length > 0) {
                html += '<ul>';
                for(var i in children) {
                    html = display_cat_r(children[i], html);
                }
                html += '</ul>';
            }
            html += '</li>';
            return html;
        }

        html = '<ul>';
        html += '<li rel="root" id="cat_0" cat_id="0"><a href="#"><ins>&nbsp;</ins>Catégories</a><ul>';
        for(var i in ldc.data.cats) {
            html = display_cat_r(ldc.data.cats[i], html);
        }
        html += '</ul></li></ul>';
        jDiv.append(html);


        /* jstree events */
        $(SELECTOR).bind("create.jstree", function(e, data) {
                var fNode = $(SELECTOR).jstree("get_selected");
                var fId = xtractId($(fNode).attr("id"));
                var name = $(SELECTOR+" li.new a").text();
                name = name.substring(1, name.length);
                DEBUG("["+name+"]");
                ldc.cat.add(name, fId, function(id) {
                    $(SELECTOR+" li.new").attr("id", "cat_"+id).removeClass("new");
                });
                return false;
        });

        $(SELECTOR).bind("rename.jstree", function(e, data) {
            var fNode = $(SELECTOR).jstree("get_selected");
            var id = xtractId($(fNode).attr("id"));
            var name = $(fNode).children("a").text();
            name = name.substring(1, name.length);
            ldc.cat.rename(id, name);
            return false;
        });

        $(SELECTOR).bind("remove.jstree", function(e, data) {
            var id = xtractId(ldc.catTree.idToRemove);
            ldc.cat.del(id);
        });

        $(SELECTOR).jstree({
            "themes" : {
                "theme" : "classic",
                "dots" : true,
                "icons" : false
            },
            "plugins" : [ "themes",  "html_data", "ui", "crrm" ],
            "core" : { "initially_open" : [ "cat_0" ], "animation": 0 },
            "ui" :{ "select_limit" : 1},
        });

        IS_INIT = true;

    }




    ldc.catTree.fill = function () {
        if (!IS_INIT) {
            getCategories();
        }
    }


    ldc.catTree.create = function() {
        var node = ($(SELECTOR).jstree("get_selected"));
        if ($(node).attr('class')=='new') {
            ldc.logger.error("Classe parente invalide");
            return false;
        }
        $(SELECTOR).jstree("create", null, "inside", {"attr": {'class':"new"}});
    }

    ldc.catTree.rename = function() {
        $(SELECTOR).jstree("rename");
    }

    ldc.catTree.remove = function() {
        ldc.catTree.idToRemove = $($(SELECTOR).jstree("get_selected")).attr("id");
        $(SELECTOR).jstree("remove");
    }

    ldc.catTree.getSelected = function() {
        return ($(SELECTOR).jstree("get_selected"));
    }

    function xtractId(str) {
        var tmp = str.split('_');
        return tmp[1];
    }

    $.getJSON(AJAX_URL, function(data) {
        ldc.catTree.cats = data;
        post_cb("ldc.catTree");
    });

}


