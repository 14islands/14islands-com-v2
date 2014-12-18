# module Jekyll

#   class PJAXPage < Page

#     def initialize(site, base, dir, page)
#       @site = site
#       @base = base
#       @dir = dir
#       @name = page.name

#       self.process(@name)

#       # puts "writing page %s" % @name
#       # puts "to dir %s" % @dir
#       # puts "page layout %s " % page.data['layout']
#       # puts "page content %s" % page.content

#       #self.read_yaml(File.join(base, '_layouts'), 'pjax.html')
#       #self.read_yaml(File.join(base, dir), @name)
#       #self.read_yaml(File.join(base, '_layouts'), 'category_index.html')
#       #self.data['category'] = category
#       #category_title_prefix = site.config['category_title_prefix'] || 'Category: '

#       #self.data['title'] = "#{page.data["title"]}"
#       #self.data['content'] = "#{page.content}"

#       self.read_yaml(File.join(base, page.dir), @name)

#       data.default_proc = proc do |hash, key|
#         site.frontmatter_defaults.find(File.join(page.dir, @name), type, key)
#       end

#     end
#   end

#   class PJAXPost < Post
#     def initialize(site, source, dir, post)
#       @site = site
#       @dir = dir

#       #puts "OOOO BASE %s " % containing_dir(source, @dir)

#       @origDir = post.path
#       postName = post.name
#       @origDir.slice! postName
#       @origDir.slice! "_posts/"

#       puts "PATH %s" % post.path
#       puts "ORIG DIR %s" % @origDir

#       @base = containing_dir(source, @origDir)
#       @name = post.name

#       puts "BASE DIR %s" % @base

#       self.categories = post.path.downcase.split('/').reject { |x| x.empty? }

#       puts "self categories done"

#       process(@name)

#       puts "process done"

#       read_yaml(@base, @name)

#       puts "read yaml done %s %s" % [@base, @name]
#       #self.read_yaml(File.join(base, page.dir), @name)

#       data.default_proc = proc do |hash, key|
#         site.frontmatter_defaults.find(post.path, type, key)
#       end

#       if data.key?('date')
#         self.date = Utils.parse_date(data["date"].to_s, "Post '#{relative_path}' does not have a valid date in the YAML front matter.")
#       end

#       populate_categories
#       populate_tags
#     end

#   end

#   class CategoryPageGenerator < Generator
#     safe true

#     def generate(site)

#       dir = site.config['snippets_dir'] || 'pjax_fragments'


#       if site.layouts.key? 'pjax'

#         puts "Found %s pages" % site.pages.length
#         site.pages.each do |page|
#           unless page.path.include? dir
#             puts "Creating PJAX Page %s" % page.name

#             puts "LAYOUT BEFORE: %s" % page.data['layout']

#             ajaxPage = PJAXPage.new(site, site.source, File.join(dir, page.dir), page)
#             ajaxPage.data['layout'] = 'pjax'

#             site.pages << ajaxPage
#           end
#         end

#         puts "Found %s Posts" % site.posts.length
#         site.posts.each do |post|
#           unless post.path.include? dir
#             puts "Creating PJAX post %s" % post.name

#             puts "LAYOUT BEFORE: %s" % post.data['layout']

#             puts "PATH BEFORE: %s" % post.path
#             postName = post.name
#             origDir = post.path
#             origDir.slice! postName
#             origDir.slice! "_posts"
#             puts "DIR BEFORE: %s" % File.join(dir, post.dir)

#             puts "POST origDir: %s" % origDir
#             #puts "POST PATH: %s" % post.path
#             #puts "POST: %s" % post

# #3rd param seems to be where it is saved. can we get that to look correct here first?

#             #ajaxPost = PJAXPost.new(site, site.source, File.join(dir, post.dir), post)
#             ajaxPost = Post.new(site, site.source, origDir, post.name)
#             ajaxPost.data['layout'] = 'pjax'

#             site.posts << ajaxPost
#           end
#         end
#       end



#     end
#   end

# end
