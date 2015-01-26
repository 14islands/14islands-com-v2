# http://ajclarkson.co.uk/blog/jekyll-category-post-navigation/
module Jekyll
  class WithinCategoryPostNavigation < Generator
    def generate(site)

      site.categories.each_pair do |category, posts|

        # sort by priority if available - otherwise default
        posts.sort! { |a,b| if a.data["priority"] and b.data["priority"] then a.data["priority"] <=> b.data["priority"] else b <=> a end}

        # remove private posts
        if site.config["hide_private"] == true
          posts = posts.delete_if {|x| x.data["private"] == true}
        end

        posts.each do |post|
          index = posts.index post
          next_in_category = nil
          previous_in_category = nil
          if index
            if index < posts.length - 1
              next_in_category = posts[index + 1]
            end
            if index > 0
              previous_in_category = posts[index - 1]
            end
          end
          post.data["next_in_category"] = next_in_category unless next_in_category.nil?
          post.data["previous_in_category"] = previous_in_category unless previous_in_category.nil?
          post.data["first_in_category"] = posts[0]
        end
      end
    end
  end
end
