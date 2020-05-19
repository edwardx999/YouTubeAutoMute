OUT = extension
BUILD = intermediate_build
ifeq ($(OS),Windows_NT)
	COPY = copy
	DEL = del /q
	EXEC_DIR = .\\node_modules\\.bin\\
	CURR_DIR = .\\
else
	COPY = cp
	DEL = rm
	EXEC_DIR = ./node_modules/.bin/
	CURR_DIR = ./
endif

build: build_status $(OUT)/options.html $(OUT)/manifest.json | $(OUT) $(BUILD)

build_status: *.ts 
	$(EXEC_DIR)tsc --build
	$(EXEC_DIR)webpack --config $(CURR_DIR)webpack_main.config.js
	$(EXEC_DIR)webpack --config $(CURR_DIR)webpack_page_change.config.js
	$(EXEC_DIR)webpack --config $(CURR_DIR)webpack_options.config.js
	touch $@
	
$(OUT)/options.html: options.html
	$(COPY) $< $(OUT)
	
$(OUT)/manifest.json: manifest.json
	$(COPY) $< $(OUT)
	
$(OUT):
	mkdir $@

$(BUILD):
	mkdir $@
	
install:
	npm install
	
clean:
	$(DEL) build_status
	$(DEL) $(BUILD)\*
	rmdir $(BUILD)
	$(DEL) $(OUT)\*