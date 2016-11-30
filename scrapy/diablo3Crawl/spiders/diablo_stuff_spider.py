#!/usr/bin/python3 
# -*-coding:utf-8 -*

import scrapy
import re

class DiabloStuffSpider(scrapy.Spider):
    name = "diabloStuff"

    start_urls = ['http://eu.battle.net/d3/fr/item/']

    def quality(self, x): #calcul de la qualité (magique, commun, légendaire)
        if not x:
            return None
        x = x.split()
        if x[len(x)-1] == "légendaire" or x[len(x)-1] == "légendaires":
            return "légendaire"
        elif x[len(x)-1] == "magique" or x[len(x)-1] == "magiques":
            return "magique"
        elif x[len(x)-1] == "rare" or x[len(x)-1] == "rares":
            return "rare"
        elif x[len(x)-1] == "d'ensemble":
            return "d'ensemble"
        else:
            return "commun"

    def cleanHtml(self, x): #nettoyage balise html
        if not x:
            return None
        return re.sub('<[^>]*>', '', x)

    def parse(self, response):
        for href in response.css('div.column-1 a::attr(href)').extract():
            yield scrapy.Request(response.urljoin(href),
                                 callback=self.parse_stuffs)

    def parse_stuffs(self, response):
        slot = response.css('h2.header-2::text').extract_first().strip()
        stuff_type = response.css('h2.header-2 small::text').extract_first().strip()
            
        for stuff in response.css('div.table-items tbody tr'):
            yield {
                #slot = emplacement de l'équipement
                'slot': slot,
                #type = type d'équipement (main gauche, compagnons, épaules... )
                'type': stuff_type,
                #name = nom du suff
                'name': stuff.css('td.column-item h3.subheader-3 a::text').extract_first().strip(),
                #quality = commun, magique, légendaire...
                'quality': self.quality(stuff.css('ul.item-type span::text').extract_first()),
                #level = level minimum
                'level': stuff.css('td.column-level h3.subheader-3::text').extract_first(),
                #armor = stat d'armure et d'épine
                'armor': self.cleanHtml(' & '.join(stuff.css('ul.item-armor-weapon li p').extract()).strip()),
                #property_choice = quand le stuff à plusieurs possibilités de propriétés aléatoires définies
                'property_choice': self.cleanHtml(' & '.join(stuff.css('li.item-effects-choice span.d3-color-blue').extract()).strip()),
                #property_default = carak primaires et secondaires classiques (orange sur le site pour les secondaires)
                'property_default': self.cleanHtml(' & '.join(stuff.css('li.d3-item-property-default p').extract()).strip()),
                #property_utility = carak secondaires non classique (bleue sur le site)
                'property_utility': ' '.join(stuff.css('li.d3-item-property-utility *::text').extract()).strip(),
                #property_random = nombre de propriété supplémentaires non prédéfinie
                'property_random': ' '.join(stuff.css('li.d3-color-blue:not(.d3-item-property-default):not(.d3-item-property-utility):not(.empty-socket) *::text').extract()).strip(),
                #property_socket = chasse(s)
                'property_socket': ' & '.join(stuff.css('li.empty-socket::text').extract()).strip(),
                #item-extra = "lié au compte" etc
                'item-extra': stuff.css('ul.item-extras li::text').extract_first(),
                #item-unique = Objet unique équipé
                'item-unique': stuff.css('span.item-unique-equipped::text').extract_first(),
                #set = nom du set s'il y en a un (panoplie)
                'set': stuff.css('li.item-itemset-name span::text').extract_first(),
                #craft = condition pour craft le stuff s'il est craftable
                'craft': ' '.join(stuff.css('ul.item-crafting *::text').extract()).strip(),
                #img_link = liens de la miniature du stuff
                'img_link': stuff.css('div.item-details a span.icon-item-inner::attr(style)').extract_first(),
            }