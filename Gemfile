source "http://rubygems.org"

#gem 'jekyll', '~>2.4.0'
#gem 'redcarpet', '~>3.1'
#gem 'sass', '>=3.4'

require 'json'
require 'open-uri'
versions = JSON.parse(open('https://pages.github.com/versions.json').read)

gem 'github-pages', versions['github-pages']
