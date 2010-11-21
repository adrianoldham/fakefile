var FakeFile = Class.create({
    options: {
        cleanClass: "clean",
        dirtyClass: "dirty",
        fileClass: "real",
        fakeFileClass: "fake",
        fileAddClass: "add",
        fileCancelClass: "cancel",
        setFileButtonPosition: true,
        cleanOnFakeFileClick: true,
        onUpdate: function () {}
    },

    initialize: function(selector, options) {
        this.options = Object.extend(Object.extend({ }, this.options), options || { });

        this.elements = $$(selector).map(function(element) {
            return new FakeFile.Element(element, this, this.options)
        }.bind(this));
    }
});


FakeFile.Element = Class.create({
    options: {
    },

    initialize: function(element, parent, options) {
        this.options = Object.extend(Object.extend({ }, this.options), options || { });
        this.element = $(element);
        this.parent = $(parent);

        this.element = element.setOpacity(0);
        this.container = element.up();
        this.setupFakeFile();
        this.setupRealFile();
    },

    setupFakeFile: function() {
        // Create dom elements
        this.fileAdd = new Element("div", { "class": this.options.fileAddClass });
        this.fileCancel = new Element("div", { "class": this.options.fileCancelClass });
        this.fakeFile = new Element("input", { "type": "text", "class": this.options.cleanClass + " " + this.options.fakeFileClass, "readonly": "readonly" });

        // Copy existing classes and id from the real input
        this.fakeFile.addClassName(this.element.className);
        this.fakeFile.writeAttribute("id", this.element.readAttribute("id"));

        // Attach to each other
        this.container.insertBefore(this.fakeFile, this.element);
        this.container.insert(this.fileCancel);
        this.container.insert(this.fileAdd);
        this.fileAdd.insert(this.element);

        // Position elements
        if (this.options.setFileButtonPosition) {
            this.container.setStyle({ position: "relative" });
            this.fileAdd.setStyle({ position: "absolute", top: 0, right: 0, zIndex: 1 });
            this.fileCancel.setStyle({ position: "absolute", top: 0, right: 0, zIndex: 2 });
        }

        // Hide the cancel button until there is a file value
        this.fileCancel.hide();

        // Setup the element attributes and events
        this.setupAttributes();
        this.setupEvents();
    },

    setupRealFile: function() {
        // Clear existing classes
        this.element.className = "";

        // Identify the real file input
        this.element.addClassName(this.options.fileClass);

        // Remove title and id from the real file input
        this.element.writeAttribute("title", "");
        this.element.writeAttribute("id", "");
    },

    setupAttributes: function() {
        // Save the original title to use later
        this.defaultText = this.element.readAttribute('title');

        // Apply the original title as the fake file title & value
        this.fakeFile.writeAttribute("value", this.defaultText);
        this.fakeFile.writeAttribute("title", this.defaultText); // Either requires a callback to "Informer" to reload, or init after informer
    },

    setupEvents: function() {
        // Attach the events to the buttons
        if (this.options.cleanOnFakeFileClick) {
            this.fakeFile.observe('click', this.clean.bind(this));
        }
        this.fileCancel.observe('click', this.clean.bind(this));
        this.element.observe('change', this.dirty.bind(this));
    },

    clean: function() {
        // Reset real and fake input values
        this.element.value = "";
        this.fakeFile.value = this.defaultText;

        // Switch class to clean
        this.fakeFile.removeClassName(this.options.dirtyClass);
        this.fakeFile.addClassName(this.options.cleanClass);

        // Switch visibility to show add button
        this.fileCancel.hide();
        this.fileAdd.show();

        // Callback on update
        this.options.onUpdate();
    },

    dirty: function() {
        // Set fake input value the same as the real input value
        this.fakeFile.value = this.element.value;

        // Switch class to dirty
        this.fakeFile.removeClassName(this.options.cleanClass);
        this.fakeFile.addClassName(this.options.dirtyClass);

        // Switch visibility to show cancel button
        this.fileCancel.show();
        this.fileAdd.hide();

        // Callback on update
        this.options.onUpdate();
    }

});
