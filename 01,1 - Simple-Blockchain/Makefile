.PHONY: test lint

full: lint test

lint:
	python3 -m pylint ./src

test:
	python3 -m pytest .

build:
	python3 -m build