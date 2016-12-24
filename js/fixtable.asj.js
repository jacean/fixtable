;

(function ($) {
    /**
     * use in jquery1.3.2
     * css获取宽度的不同
     */

    var defaultOption = {
        customwidth: 550,
        customHeight: 300,
        fixcol: "",
        fixrow: "",
        hidecol: "",
        hiderow: ""
    };
    function px2num(pxnum) {
        return parseFloat(pxnum.slice(0, -2));
    }
    function tonumber(num) {
        return parseFloat(num);
    }
    function hasScroll(dom) {
        var scrollStatus = {
            x: false,
            y: false,
            xheight: 0,
            ywidth: 0
        }
        var xheight = (dom.offsetHeight - 4) - dom.clientHeight;
        if (xheight > 0) {
            scrollStatus.x = true;
            scrollStatus.xheight = xheight;
        }
        var ywidth = dom.offsetWidth - 4 - dom.clientWidth;
        if (ywidth > 0) {
            scrollStatus.y = true;
            scrollStatus.ywidth = ywidth;
        }
        return scrollStatus;
    }
    var FixTable = function (_$dom, _option) {
        if (_$dom.length < 1) {
            return;
        }
        this.$table = _$dom;
        this.FULLID = this.$table.attr('id');
        this.TABLEID = this.FULLID.substr(5);//jTbl_D_GRID-->>D_GRID
        this.options = $.extend(defaultOption, _option);
        var fixrow = this.options.fixrow,
            fixcol = this.options.fixcol,
            customwidth = this.options.customwidth,
            customHeight = this.options.customHeight,
            hidecol = this.options.hidecol,
            hiderow = this.options.hiderow;

        this.point = {
            x: 0,
            y: 0
        }
        /**固定行列的选择器集合*/
        this.fixselector = {
            row: new Array(),
            col: new Array()
        };

        //获取行列信息
        var rownum = 0;
        var colnum = 0;
        var colsWidth = 0;
        var rowsHeight = 0;
        this.colArray = this.getColArray();
        this.rowArray = this.getRowArray();

        this.initDom();
        //填充数据
        this.loadData();

        this.fixcols(fixcol);

        this.fixrows(fixrow);

        this.hidecol(hidecol);

        this.hiderow(hiderow);

        this.$table.hide();

        function scrollbind() {
            this.$header.scrollLeft(this.$tableContent.scrollLeft());
            this.$tableleft.scrollTop(this.$tableContent.scrollTop());
        }
        this.$tableContent.scroll(scrollbind.bind(this));

        this.setLayout();
    }
    function splitColId(id, self) {
        return id.substr(self.TABLEID.length + 5);
    }
    FixTable.prototype = {
        initDom: function () {
            this.$tableContainer = $('<div class="table-container"></div>');
            this.$tableContent = $('<div class="table-content"></div>');
            this.$table_attr_hide = $('<div class="table-attr-hide"></div>');
            this.$table_ctr_hide = $('<div class="table-ctrl-hide"></div>');
            this.$tableleft = $('<div class="table-left"></div>');
            this.$tablelt = $('<div class="table-lt"></div>').width(0).height(0);
            this.$header = $('<div class="table-header"></div>').width(0);
            this.$middle = $('<div class="table-middle"></div>');

            this.$middle.append(this.$tableleft).append(this.$tableContent);
            this.$tableContainer.append(this.$header).append(this.$middle).append(this.$tablelt);
            this.$table.after(this.$tableContainer);

            this.initContainer(this.options.customwidth, this.options.height);

        },
        getColArray: function () {
            var self = this;
            var $cols = this.$table.find("col");//col标注的列宽不对
            // var $cols = this.$table.find("thead tr th");
            var colArray = new Array();
            var i = 0;
            var widths = 0;
            $cols.each(function () {
                i++;
                var width = tonumber($(this).attr('jWidth'));
                colArray[i] = {
                    no: i,
                    id: splitColId(this.id, self),
                    fullid: this.id,
                    width: width
                };
                widths += width;
            });
            colArray[0] = {
                colsnum: i,
                colswidth: widths
            }
            return colArray;

        },
        getRowArray: function () {
            var self = this;
            var $trs = this.$table.find("thead tr,tbody tr:visible,tfoot tr");
            //head和foot里是th，body里是td       
            var rowArray = new Array();
            var i = 0;
            var heights = 0;
            $trs.each(function () {
                i++;
                rowArray[i] = {
                    no: i,
                    id: this.id,
                    height: $(this).height()
                }
                heights += $(this).height();
            });
            rowArray[0] = {
                rowsnum: i,
                rowsheight: heights
            }
            return rowArray;
        },
        initContainer: function (customwidth, customHeight) {
            var scale = 1;//宽度缩放比例
            var containerWidth = typeof customwidth == "undefined" ? window.innerWidth : customwidth;
            var colsWidth = this.colArray[0].colswidth,
                rowsHeight = this.rowArray[0].rowsheight;
            if (colsWidth < containerWidth) {
                scale = 1.0 * containerWidth / colsWidth;
            }
            this.$tableContainer.width(containerWidth);
            var containerHeight = typeof customHeight == "undefined" ? window.innerHeight : customHeight;
            if (rowsHeight < containerHeight) {
                containerHeight = rowsHeight;
            }
            this.$tableContainer.height(containerHeight);
            this.scale = scale;
        },
        /**
         * @return:this.scale
         */
        setContainerSize: function (customwidth, customHeight) {
            if (customwidth < this.point.x) {
                console.log("宽度参数过小");
                return;
            }
            if (customHeight < this.point.y) {
                console.log("高度参数过小");
                return;
            }
            this.initContainer(customwidth, customHeight);
            this.resizeContainer();
            // this.setLayout();
        },
        resizeContainer: function () {
            //隐藏行后可能会出现内容过短的情况，此时需要减小容器高度
            var allwidth = this.$tableContainer.width();
            var allheight = this.$tableContainer.height();
            var realHeight = 0;
            var $contenttrs = this.$tableContent.find(".table-tr");
            $contenttrs.each(function () {
                realHeight += $(this).height();
            });
            realHeight += this.point.y;
            if (realHeight < this.$tableContainer.height()) {
                this.$tableContainer.height(realHeight);
            }
            var scrollStatus = hasScroll(this.$tableContent[0]);
            if (scrollStatus.x) {
                realHeight += scrollStatus.xheight;
            }
            this.$tableContent.width(allwidth - this.point.x);
            this.$tableContent.height(realHeight - this.point.y);
            this.setLayout();
        },
        setLayout: function () {

            this.$header.css({ left: this.point.x + 'px', top: 0 + 'px' });
            this.$tableleft.css({ left: 0 + 'px', top: this.point.y + 'px' });
            this.$tableContent.css({ left: this.point.x + 'px', top: this.point.y + 'px' });
            this.$tablelt.css({ left: 0, top: 0 });
            this.$tablelt.width(this.point.x);
            this.$tableleft.width(this.point.x);
            //滚动条处理
            //clientHeight，可视区
            //offsetHeight,带滚动条的实战区
            //var scrollStatus = hasScroll($tableContent[0]);            
            //scroll会扩展自身宽高,所以不用再调整scroll的宽高来对准point
            this.$header.width(this.$tableContent[0].clientWidth);
            this.$tableleft.height(this.$tableContent[0].clientHeight);

        },
        loadData: function () {
            //可以考虑header\body\footer分别加载
            var self = this;
            $trs = this.$table.find('thead tr,tbody tr:visible,tfoot tr');//1.3.2会自己加tbody
            var $tds;
            var colwidth;
            var nowrow = 0;
            var nowcol = 0;
            var attrHideFlag = false;

            var colnum = this.colArray[0].colsnum,
                colsWidth = this.colArray[0].colswidth,
                rownum = this.rowArray[0].rowsnum,
                rowsHeight = this.rowArray[0].rowsheight;

            $trs.each(function () {
                nowrow++;
                nowcol = 0;
                colwidth = 0;
                var tdheight = 0;
                attrHideFlag = false;
                var $trdiv = $("<div class='table-tr '></div>");
                var $hidetr = $("<div class='table-tr table-attr-hide'></div>");
                $tds = $(this).children('td,th');
                $tds.each(function () {
                    var $td = $(this);
                    var $tddiv;
                    /**如果属性市display:none的话，直接放入$table_attr_hide表中,当重新刷新数据并更改属性隐藏的时候重新加载整个fixtable*/
                    if ($td.css('display') == "none") {
                        $tddiv = $("<div class='table-td table-attr-hide '></div>");
                        $tddiv.html($(this).html());
                        $hidetr.append($tddiv);
                        attrHideFlag = true;
                        return;
                    }
                    nowcol++;
                    //colwidth = $td.width() * self.scale;                   
                    colwidth = self.colArray[nowcol].width * self.scale;

                    //  console.log(nowrow + "-" + nowcol + ":" + colwidth);
                    // tdheight=$td.css('height');
                    tdheight = Math.max(tdheight, px2num($td.css('height')));

                    if (nowrow == 1) {
                        $tddiv = $("<div class='table-td table-tr-" + nowrow + " table-td-" + nowcol + " table-td-header'></div>");
                    } else if (nowrow == rownum) {
                        $tddiv = $("<div class='table-td table-tr-" + nowrow + " table-td-" + nowcol + " table-td-footer'></div>");
                    } else {
                        $tddiv = $("<div class='table-td table-tr-" + nowrow + " table-td-" + nowcol + "'></div>");
                    }
                    $tddiv.html($(this).html());
                    $tddiv.css("width", colwidth + "px");
                    // $tddiv.css("height", tdheight);
                    $trdiv.append($tddiv);
                    //console.log(nowrow+"-"+nowcol+":"+tdheight);


                });
                $trdiv.width(colsWidth * self.scale);
                $trdiv.children('div').height(tdheight);
                // $trdiv.height(tdheight);
                self.$tableContent.append($trdiv);
                if (attrHideFlag) {
                    self.$table_attr_hide.append($hidetr);
                }

            });

        },
        fixcols: function (_cols) {
            var cols = new Array();
            if (typeof _cols == "string") {
                if (_cols == "") return;
                cols[0] = _cols;
            }
            if (_cols instanceof Array) {
                cols = _cols;
            }
            var colslength = cols.length;
            //将选择器转换成fixtable可以识别的选择器
            var colArray = this.colArray;
            for (var x = 0; x < colslength; x++) {
                for (var j = 1; j < colArray.length; j++) {
                    if (colArray[j].id == cols[x]) {
                        // cols[x] = "#" + colArray[j].fullid;//用id来进行选取
                        cols[x] = ".table-td-" + colArray[j].no;
                        break;
                    }
                }
            }

            // console.log(cols);

            for (var i = 0; i < colslength; i++) {
                var $fixcol;
                $fixcol = $("<div class='table-fix-col'></div>");
                var $sels = this.$tableContent.find(cols[i]);
                if ($sels.length == 0) {
                    continue;
                }
                $sels.addClass("table-fix-td");
                var fixwidth = px2num($sels.css('width'));
                $fixcol.width(fixwidth);
                $fixcol.append($sels);

                this.$tableContainer.find('.table-tr').width($('.table-tr').width() - fixwidth);
                var leftwidth = px2num(this.$tableleft.css('width'));
                // var fixwidth = px2num($fixcol.css('width'));
                this.$tableleft.css('width', (leftwidth + fixwidth));//先保持为原本的为填充数据状态
                this.$tableleft.append($fixcol);//直接迁移，不复制
                this.$tableContent.width(this.$tableContainer.width() - this.$tableleft.width());
                // this.$tableleft.height(this.$tableContent.height());
                this.point.x += $fixcol.width();
                this.$tablelt.width(this.$tablelt.width() + $fixcol.width());
            }
            this.fixselector.col = cols;
            this.removemix(this.fixselector);
            this.setLayout();
        },
        fixrows: function (_rows) {
            var rows = new Array();
            if (typeof _rows == "string") {
                //  if(_rows=="")return;
                rows[0] = _rows;
            }
            if (_rows instanceof Array) {
                rows = _rows;
            }
            var rowslength = rows.length;
            var $fixrow;
            var border = 1;

            var rowArray = this.rowArray;
            for (var x = 0; x < rowslength; x++) {
                for (var j = 1; j < rowArray.length; j++) {
                    if (rowArray[j].id == rows[x]) {
                        // rows[x] = "#" + rowArray[j].fullid;//用id来进行选取
                        rows[x] = ".table-tr-" + rowArray[j].no;
                        break;
                    }
                }
            }

            for (var i = 0; i < rowslength; i++) {
                $fixrow = $("<div class='table-fix-row'></div>");
                var cw = 0;
                var $sels = this.$tableContent.find(rows[i]);
                if ($sels.length == 0) {
                    continue;
                }
                $sels.addClass("table-fix-tr");
                $sels.each(function () {
                    //$(rows[i]).each(function(){
                    cw += $(this).width();
                    cw += border;
                });
                $fixrow.width(cw);
                $fixrow.append($sels);
                this.$header.append($fixrow);
                this.point.y += $fixrow.height();
                this.$tablelt.height(this.point.y);
                this.$tableContent.height(this.$tableContainer.height() - this.point.y);
                //this.$tableleft.find(rows[i]).remove();//删除重复??????保留行重复还是列重复
            }
            this.fixselector.row = rows;
            this.removemix(this.fixselector);

            this.setLayout();
        },
        removemix: function (selectors) {
            var row = selectors.row;
            var col = selectors.col;
            var rl = row.length,
                cl = col.length;
            for (var i = 0; i < rl; i++) {
                for (var j = 0; j < cl; j++) {
                    // this.$tableContainer.find(row[i] + col[j]).remove();
                    this.$tablelt.append(this.$tableContainer.find(row[i] + col[j]));
                }
            };
        },
        hidecol: function (_cols) {
            var cols = new Array();
            if (typeof _cols == "string") {
                if (_cols == "") return;
                cols[0] = _cols;
            }
            if (_cols instanceof Array) {
                cols = _cols;
            }
            var colslength = cols.length;

            //将选择器转换成fixtable可以识别的选择器
            var colArray = this.colArray;
            for (var x = 0; x < colslength; x++) {
                for (var j = 1; j < colArray.length; j++) {
                    if (colArray[j].id == cols[x]) {
                        // cols[x] = "#" + colArray[j].fullid;//用id来进行选取
                        cols[x] = ".table-td-" + colArray[j].no;
                        break;
                    }
                }
            }

            for (var i = 0; i < colslength; i++) {
                var $sels = this.$tableContainer.find(cols[i]);
                if ($sels.length == 0) {
                    continue;
                }
                $sels.each(function () {
                    $(this).addClass("table-ctrl-hide-col");
                });
                var hidewidth = $sels.width();
                var oldwidth = px2num(this.$tableContainer.css('width'));
                var nowwidth = oldwidth - hidewidth;
                var hidescale = 1.0 * oldwidth / nowwidth;
                if ($sels.hasClass("table-fix-td")) {
                    //fixcol需要重新计算除隐藏列外的宽度
                    this.point.x -= hidewidth;
                    console.log("hide");
                } else {
                    //$tableContentd的宽度不变，调整每列的宽度
                    this.$tableContainer.find('.table-tr').width($('.table-tr').width() - hidewidth);
                }

                this.setscale(['.table-td', '.table-tr', '.table-fix-col', '.table-fix-row'], hidescale);


            }
            this.setLayout();
        },
        setscale: function (_selectors, _scale) {
            var selectors = new Array();
            if (typeof _selectors == "string") {
                selectors[0] = _selectors;
            }
            if (_selectors instanceof Array) {
                selectors = _selectors;
            }
            var selslength = selectors.length;
            for (var i = 0; i < selslength; i++) {
                this.$tableContainer.find(selectors[i]).each(function () {
                    $(this).width($(this).width() * _scale);

                });;
            }
            this.point.x *= _scale;
            this.setLayout();
        },
        hiderow: function (_rows) {
            var rows = new Array();
            if (typeof _rows == "string") {
                if (_rows == "") return;
                rows[0] = _rows;
            }
            if (_rows instanceof Array) {
                rows = _rows;
            }
            var rowslength = rows.length;


            //将选择器转换成fixtable可以识别的选择器
            var rowArray = this.rowArray;
            for (var x = 0; x < rowslength; x++) {
                for (var j = 1; j < rowArray.length; j++) {
                    if (rowArray[j].id == rows[x]) {
                        // rows[x] = "#" + rowArray[j].fullid;//用id来进行选取
                        rows[x] = ".table-tr-" + rowArray[j].no;
                        break;
                    }
                }
            }

            var $hiderow;
            for (var i = 0; i < rowslength; i++) {
                var cw = 0;
                var $sels = this.$tableContainer.find(rows[i]);
                if ($sels.length == 0) {
                    continue;
                }
                $sels.each(function () {
                    $(this).addClass('table-ctrl-hide-row');
                });
            }
            this.resizeContainer();
        },
        hidecell: function (r, c) {
            var colArray = this.colArray;

            for (var j = 1; j < colArray.length; j++) {
                if (colArray[j].id == c) {
                    // cols[x] = "#" + colArray[j].fullid;//用id来进行选取
                    c = ".table-td-" + colArray[j].no;
                    break;
                }
            }

            var rowArray = this.rowArray;

            for (var j = 1; j < rowArray.length; j++) {
                if (rowArray[j].id == r) {
                    // rows[x] = "#" + rowArray[j].fullid;//用id来进行选取
                    r = ".table-tr-" + rowArray[j].no;
                    break;
                }
            }

            var hides=this.$tableContainer.find(r + c).addClass("table-td-hide");
            var $hidediv=$("<div class='table-td-hide-mask'>"+
            "</div>");
            $hidediv.css('width',hides.css('width'));
            $hidediv.css('height',hides.css('height'));
            this.$tableContainer.find(r + c).append($hidediv);
        },
        removehidecell:function(){
            var hides=this.$tableContainer.find(".table-td-hide");
            hides.removeClass(".table-td-hide");
            hides.find(".table-td-hide-mask").remove();
        }


    };
    $.fn.fixtable = function (options) {
        var f;
        this.each(function () {
            // $(this).data('fixtable', new FixTable($(this), options));
            // this.setAttribute('data-fixtable',new FixTable($(this),options));
            f = new FixTable($(this), options);
            // this.dataset.fixtable=JSON.stringify(new FixTable($(this),options)).replace(/'/g, "\\'");
        });
        return f;
    }

} (window.jQuery));