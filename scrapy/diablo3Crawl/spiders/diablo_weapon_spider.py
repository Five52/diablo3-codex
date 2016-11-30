#!/usr/bin/python3 
# -*-coding:utf-8 -*

import scrapy
import re

class DiabloWeaponSpider(scrapy.Spider):
    name = "diabloWeapon"

    start_urls = ['http://eu.battle.net/d3/fr/item/']

    def quality(self, x, y): #calcul de la qualité (magique, commun, légendaire)
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
        for href in response.css('div.column-2 a::attr(href)').extract():
            yield scrapy.Request(response.urljoin(href),
                                 callback=self.parse_weapons)

    def parse_weapons(self, response):
        weapon_type = response.css('h2.header-2::text').extract_first().strip()
        category = response.css('h2.header-2 small::text').extract_first().strip()
            
        for weapon in response.css('div.table-items tbody tr:not(.no-result)'):
            yield {
                #slot = emplacement de l'équipement
                'category': category,
                #type = type d'équipement (main gauche, compagnons, épaules... )
                'type': weapon_type,
                #name = nom du suff
                'name': weapon.css('td.column-item h3.subheader-3 a::text').extract_first().strip(),
                #quality = commun, magique, légendaire...
                'quality': self.quality(weapon.css('ul.item-type span::text').extract_first(), category),
                #level = level minimum
                'level': weapon.css('td.column-level h3.subheader-3::text').extract_first(),
                #damage = dps
                'damage': self.cleanHtml(' & '.join(weapon.css('ul.item-armor-weapon li').extract()).strip()),
                #property_choice = quand le weapon à plusieurs possibilités de propriétés aléatoires définies
                'property_choice': self.cleanHtml(' & '.join(weapon.css('li.item-effects-choice span.d3-color-blue').extract()).strip()),
                #property_default = carak primaires et secondaires classiques (orange sur le site pour les secondaires)
                'property_default': self.cleanHtml(' & '.join(weapon.css('li.d3-item-property-default p').extract()).strip()),
                #property_utility = carak secondaires non classique (bleue sur le site)
                'property_utility': ' '.join(weapon.css('li.d3-item-property-utility *::text').extract()).strip(),
                #property_random = nombre de propriété supplémentaires non prédéfinie
                'property_random': ' '.join(weapon.css('li.d3-color-blue:not(.d3-item-property-default):not(.d3-item-property-utility):not(.empty-socket) *::text').extract()).strip(),
                #property_socket = chasse(s)
                'property_socket': ' & '.join(weapon.css('li.empty-socket::text').extract()).strip(),
                #item-extra = "lié au compte" etc
                'item-extra': weapon.css('ul.item-extras li::text').extract_first(),
                #item-unique = Objet unique équipé
                'item-unique': weapon.css('span.item-unique-equipped::text').extract_first(),
                #set = nom du set s'il y en a un (panoplie)
                'set': weapon.css('li.item-itemset-name span::text').extract_first(),
                #craft = condition pour craft le weapon s'il est craftable
                'craft': ' '.join(weapon.css('ul.item-crafting *::text').extract()).strip(),
                #img_link = liens de la miniature du weapon
                'img_link': weapon.css('div.item-details a span.icon-item-inner::attr(style)').extract_first(),
            }