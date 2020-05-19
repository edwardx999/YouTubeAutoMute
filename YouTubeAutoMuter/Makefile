OUT := extension
BUILD := intermediate_build
ifeq ($(OS),Windows_NT)
	COPY := copy
	DEL := del /q
else
	COPY := cp
	DEL := rm
endif

build: build_status $(OUT)/options.html $(OUT)/manifest.json | $(OUT) $(BUILD)

build_status: *.ts 
	.\node_modules\.bin\tsc --build
	.\node_modules\.bin\webpack --config .\webpack_main.config.js
	.\node_modules\.bin\webpack --config .\webpack_page_change.config.js
	.\node_modules\.bin\webpack --config .\webpack_options.config.js
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