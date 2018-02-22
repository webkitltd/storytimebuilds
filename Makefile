.PHONY: images
images: ; docker build -t storytimeisland-builds www/book_app

.PHONY: build
build:
	docker run -ti --rm \
		-v $(PWD)/www/book_app/build:/app/build \
		storytimeisland-builds