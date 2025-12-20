# frozen_string_literal: true

require "net/http"
require "nokogiri"
require "uri"

class OgImageFetcher
  def self.call(url)
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.scheme == "https" ? 443 : 80)
    http.use_ssl = (uri.scheme == "https")

    req = Net::HTTP::Get.new(uri.request_uri)
    req["User-Agent"] = "aquarium-visit-log (og image fetcher)"

    res = http.request(req)
    return nil unless res.is_a?(Net::HTTPSuccess)

    doc = Nokogiri::HTML(res.body)
    og = doc.at('meta[property="og:image"]')&.[]("content")
    return nil if og.blank?

    # 相対パス対策
    URI.join(url, og).to_s
  end
end
