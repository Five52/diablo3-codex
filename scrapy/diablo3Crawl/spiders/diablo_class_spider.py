#!/usr/bin/python3 
# -*-coding:utf-8 -*

import scrapy
import re

class DiabloClassSpider(scrapy.Spider):
    name = "diabloClass"

    start_urls = ['http://eu.battle.net/d3/fr/game/']

    def parse(self, response):
        for href in response.css('ul.list-heroes li a::attr(href)').extract():
            yield scrapy.Request(response.urljoin(href),
                                 callback=self.parse_class)

    def parse_class(self, response): 
        for classe in response.css('body'):
            yield {
                'name': classe.css('div.page-header h2.header-2::text').extract_first(),
                'prez': classe.css('div.section-body div.gameplay-text p::text').extract(),
                'characteristics': classe.css('div.features ul li h3.subheader-3::text').extract(),
                'ressource': classe.css('div.resource h3.header-3::text').extract_first(),
                'class_image': 'http://eu.battle.net'+classe.css('div#artwork a img::attr(src)').extract_first(),
            }