module Jekyll

  class CategoryPage < Page
    def initialize(site, base, dir, page)
      @site = site
      @base = base
      @dir = dir
      @name = page.name#'index.html'

      self.process(@name)

      puts "LAYOUTS %s " % base

      self.read_yaml(File.join(base, '_layouts'), 'pjax.html')
      #self.data['category'] = category
      #category_title_prefix = site.config['category_title_prefix'] || 'Category: '

      self.data['title'] = "#{page.data["title"]}"
      self.data['content'] = "#{page.content}" #"#{page.content}"
    end
  end

  class CategoryPageGenerator < Generator
    safe true

    def generate(site)

      dir = site.config['snippets_dir'] || 'pjax_fragments'

      puts "PAGES: %s" % site.pages.length
      puts "POSTS: %s" % site.posts.length

      #if site.layouts.key? 'category_index'
        site.pages.each do |page|
          unless page.path.include? dir
          #puts "Page %s - %s - %s" % [page.name, page.dir, page.path]
            #puts "Page - %s" % page.content #File.join(dir, page.path)
            #§site.pages << CategoryPage.new(site, site.source, File.join(dir, page.path), page)
          end
        end
      #end
    end
  end

end
