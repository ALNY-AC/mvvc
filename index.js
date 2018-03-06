var app = new Mvvc({
    el: "#app",
    data: {
        msg: 1
    },
    methods: {
        hello: function () {
            this.setDate({
                msg: ++this.msg
            });
        }
    }
});


