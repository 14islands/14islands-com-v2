module Jekyll
  module DefaultFilter
    def default(input, default_value = "".freeze)
      is_blank = input.respond_to?(:empty?) ? input.empty? : !input
      is_blank ? default_value : input
    end
  end
end

Liquid::Template.register_filter(Jekyll::DefaultFilter)
