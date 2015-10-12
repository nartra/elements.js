(function (window, document, undefined) {

    var debug = true,
            alias_name = 'elements',
            Collector,
            app;

    function classifyGetter(query) {
        if (typeof query != 'string' || query.length == 0)
            return false;
        query = query.trim();
        var identifyer = query.charAt(0), _param = query.substring(1);
        switch (identifyer) {
            case '#':
                return {method: 'getElementById', param: _param};
            case '.':
                return {method: 'getElementsByClassName', param: _param};
            case '@':
                return {method: 'getElementsByName', param: _param};
            default:
                return {method: 'getElementsByTagName', param: query};
        }
    }

    function equery(query, parent) {
        var collector = new Collector();
        if (typeof query === 'string') {
            parent = typeof parent === 'undefined' ? document : parent;
            var i, j, result, orders, getter;
            var pack = query.split(',');
            for (i in pack) {
                orders = pack[i].trim().split(/\s+/);
                if (orders.length == 0)
                    continue;
                result = orders.shift();

                if (orders.length > 0) {
                    getter = classifyGetter(result);
                    collector.merge(equery(orders.join(' '), parent[getter.method](getter.param)));
                }
                else {
                    getter = classifyGetter(result);
                    var getting_eles = parent[getter.method](getter.param);
                    //console.log('a:', result, getter, parent);
                    //console.log('b:', getting_eles, typeof getting_eles, getting_eles.length);
                    if (typeof getting_eles === 'object') {
                        if (typeof getting_eles.length === 'number')
                            for (j = 0; j < getting_eles.length; j++) {
                                //console.info(getting_eles[j]);
                                collector.add(getting_eles[j]);
                            }
                        else
                            collector.add(getting_eles);
                    }
                }
            }
        }
        else {
            collector.add(query);
        }
        return collector;
    }

    Collector = function () {
        var obj = {
            eles: [],
            extension: {},
            //method
            test: function () {
                return this.eles;
            },
            add: function (query) {
                if (typeof query == 'string') {
                    var new_collector = equery(query);
                    for (var i in new_collector.eles) {
                        this.eles.push(new_collector.eles[i]);
                    }
                }
                else {
                    this.eles.push(query);
                }
                return this;
            },
            merge: function (collector) {
                for (var i in collector.eles) {
                    this.add(collector.eles[i]);
                }
                return this;
            },
            each: function (callback, complete) {
                if (typeof callback != 'function')
                    return;
                for (var i = 0; i < this.eles.length; i++) {
                    var collector = new Collector();
                    collector.add(this.eles[i]);
                    callback.apply(this.eles[i], [i, collector]);
                }
                if (typeof complete === 'function')
                    complete();
            },
            filter: function (callback) {
                /*if(typeof callback != 'function') return;
                 for(var i = 0; i < this.eles.length; i++){
                 callback(this.eles[i]);
                 callback.apply(this.eles[i], [i, collector]);
                 }*/
            },
            hasClass: function (class_name) {
                for (var i in this.eles) {
                    var ele = this.eles[i];
                    if (ele.className.indexOf(' ' + class_name + ' ') >= 0) {
                        return true;
                    }
                    break;
                }
                return false;
            },
            addClass: function (class_name) {
                for (var i in this.eles) {
                    var ele = this.eles[i];
                    if (ele.className.indexOf(class_name) < 0) {
                        ele.className = ele.className + ' ' + class_name;
                    }
                }
                return this;
            },
            removeClass: function (class_name) {
                for (var i in this.eles) {
                    var ele = this.eles[i];
                    ele.className = ele.className.replace(' ' + class_name + ' ', ' ');
                }
                return this;
            },
            get: function () {
                return this.eles;
            },
            eq: function (i) {
                if(typeof this.eles[i] != 'undefined')
                    this.eles = [this.eles[i]];
                return this;
            },
            event: function (event_name, callback) {
                if (typeof callback == 'function')
                    for (var i in this.eles) {
                        this.eles[i][event_name] = callback;
                    }
                return this;
            },
            css: function (prop, val) {
                for (var i in this.eles) {
                    this.eles[i].style[prop] = val;
                }
            },
            hide: function () {
                this.css('display', 'none');
                return this;
            },
            show: function (display) {
                display = typeof display == 'undefined' ? 'block' : display;
                this.css('display', display);
                return this;
            },
            attr: function (field, val) {
                var fields = '';
                for (var i in this.eles) {
                    if (typeof val !== 'undefined')
                        this.eles[i].setAttribute(field, val);
                    fields += typeof this.eles[i][field] === 'undefined' ? '' : (this.eles[i][field]);
                }
                return typeof val === 'undefined' ? fields : this;
            }
        };
        return obj;
    };
    window.Collector = Collector;

    app = function (query, parent) {
        return this.current = equery(query, parent);
    };

    app.alias = function (new_name) {
        if (typeof new_name == 'string') {
            window[new_name] = app;
        }
    };

    var _ready = [];
    var _readyed = false;
    app.ready = function (callback) {
        if (typeof callback != 'function')
            return;
        if (_readyed)
            callback();
        else
            _ready.push(callback);
    };
    window.onload = function () {
        _readyed = true;
        for (var i in _ready)
            _ready[i]();
    };

    app.alias(alias_name);

}(window, document));