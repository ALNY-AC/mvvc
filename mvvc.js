// @ts-nocheck
function bind(fn, ctx) {
    function boundFn(a) {
        var l = arguments.length;
        return l
            ? l > 1
                ? fn.apply(ctx, arguments)//通过返回函数修饰了事件的回调函数。绑定了事件回调函数的this。并且让参数自定义。更加的灵活
                : fn.call(ctx, a)
            : fn.call(ctx)
    }
    // record original fn length
    boundFn._length = fn.length;
    return boundFn;
}

var Component = function (conf) {
    if (conf != null) {
        this.$el = conf.$el;
        this.$_el = conf.$el.clone();

        for (const key in conf) {
            if (conf.hasOwnProperty(key)) {
                this[key] = conf[key];
            }
        }


    }
}


var Mvvc = function (conf) {
    var _this = this;
    this.$el = null;
    this.$elClone = null;
    this.conf = conf;
    this.mvvcComponentList = [];
    this.init = function (conf) {

        this.$el = $(conf.el);
        this.$elClone = $(conf.el).clone();

        for (const x in conf.methods) {
            if (conf.methods.hasOwnProperty(x)) {
                this[x] = bind(conf.methods[x], this);
            }
        }

        for (const x in conf.data) {
            if (conf.data.hasOwnProperty(x)) {
                this[x] = conf.data[x];
            }
        }

        this.updateDoc(this.$el);

    }
    this.updateDoc = function ($el) {

        //不是根节点的时候才进行操作
        if (('#' + $el.attr('id')) != this.conf.el) {
            this.initEvent($el);
            this.initText($el);
            this.initDirective($el);
        }

        //继续遍历
        if ($el.children().length) {
            var $els = $el.children();
            for (let i = 0; i < $els.length; i++) {
                const $doc = $els.eq(i);
                this.updateDoc($doc);
            }
        }


    }
    this.initText = function ($el) {
        var vm = this;
        var comp = new Component({
            $el: $el,
            vm: vm,
            update() {

                var text = this.$_el.text();
                var str = text.match(/{{(\S*)}}/);

                if (str) {
                    str = text.replace(`{{${str[1]}}}`, `${this.vm[str[1]]}`);
                    this.$el.text(str);
                }

            }
        });

        this.addComp(comp);


    }
    this.initEvent = function ($el) {
        var attrs = $el[0].attributes
        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i];
            const name = attrs[i].name;
            const value = attrs[i].value;

            if (name.indexOf('@') >= 0) {
                var eventName = name.split('@')[1];
                $el.on(eventName, () => {
                    this[value]();
                });
            }
        }

    }
    this.addComp = function (comp) {
        this.mvvcComponentList.push(comp);
        comp.update();
    }

    this.update = function () {

        //更新视图
        for (let i = 0; i < this.mvvcComponentList.length; i++) {
            this.mvvcComponentList[i].update();
        }

        //更新指令
        for (const x in this.directives) {
            if (this.directives[x].update) {
                this.directives[x].update(this.directives[x].$el, this.directives[x].binding, this);
            }
        }

    }
    this.setDate = function (conf) {

        for (const key in conf) {
            if (this.hasOwnProperty(key)) {
                this[key] = conf[key];
            } else {
                console.warn("未知属性！");

            }
        }
        this.update();

    }
    this.directives = {};

    this.directive = function (name, conf) {
        this.directives[name] = conf;
        this.directives[name].binding = {};

    }
    this.initDirective = function ($el) {
        //检测指令asd
        var attrs = $el[0].attributes
        for (let i = 0; i < attrs.length; i++) {
            const attr = attrs[i];
            const name = attrs[i].name;
            const value = attrs[i].value;

            if (name.indexOf('v-') >= 0) {
                var eventName = name.split('v-')[1];
                this.directives[eventName].$el = $el;
                this.directives[eventName].binding.value = value;
                this.directives[eventName].inserted($el, { value: value }, this);
            }
        }
    }

    // 注册一个全局自定义指令 `v-model`

    this.directive('model', {
        inserted: function ($el, binding, vm) {

            $el.val(vm[binding.value]);
            var save = {};

            $el.on('input', function () {
                console.log(1);
                var val = $el.val();
                save[binding.value] = val;
                vm.setDate(save);
            });

        },
        update: function ($el, binding, vm) {
            console.log($el);
            $el.val(vm[binding.value]);
        }
    })
    this.init(this.conf);

}

var hello = function () {
    console.log(1);
}


