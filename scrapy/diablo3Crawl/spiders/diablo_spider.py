import scrapy
import re

class DiabloSpellSpider(scrapy.Spider):
    name = "diabloSpell"

    start_urls = ['http://eu.battle.net/d3/fr/game/']

    def cleanHtml(self, x): #nettoyage balise html
        if not x:
            return None
        return re.sub('<[^>]*>', '', x)

    def createRunesArray(self, x):
        if not x:
            return '[]'
        if re.search('<td class=\\\"column-level align-center\\\"', x):
            runes = x.split('&')
            runesArray = []
            for rune in runes:
                runeDic = {
                    'rune_name': '',
                    'rune_level': '',
                    'rune_description': ''
                }

                rune_name = re.search('<h3 class=\\\"subheader-3\\\">\D.*<\/h3>', rune).group(0)
                runeDic['rune_name'] = re.sub('<[^>]*>', '', rune_name)

                rune_level = re.search('\">\d+<\/h', rune).group(0)
                runeDic['rune_level'] = re.search('\d+' , rune_level).group(0)

                rune_description = re.search('<div class=\\\"rune-desc\\\">.*<\/div>', rune).group(0)
                # on place un séparateur après les </p><p>
                rune_description = re.sub('<\/p><p>', '</p><p> & ', rune_description)
                #on nettoie les balises
                runeDic['rune_description'] = re.sub('<[^>]*>', '', rune_description)

                #on stock dans notre tableau: 
                runesArray.append(runeDic)

            return runesArray
        return '[]'

    def parse(self, response):
        #folow links to specific class page
        for href in response.css('ul.list-heroes a::attr(href)').extract():
            yield scrapy.Request(response.urljoin(href),
                                 callback=self.parse_class)

    def parse_class(self, response):
        #folow links to specific class page
        compActive = response.css('li.menu-active-skill a::attr(href)').extract_first()
        yield scrapy.Request(response.urljoin(compActive),
                                 callback=self.parse_skills_active)
        compPassive = response.css('li.menu-passive-skill a::attr(href)').extract_first()     
        yield scrapy.Request(response.urljoin(compPassive),
                                 callback=self.parse_skills_passive)

    def parse_skills_passive(self, response):

        class_name = response.css('h2.header-2 a::text').extract_first()
            
        for skills in response.css('div.table-skills tbody tr'):
            yield {
                'class_name': class_name,
                'name': skills.css('td.column-skill h3.subheader-3 a::text').extract_first(),
                'spell': 'passive',
                'level': skills.css('td.column-level h3.subheader-3::text').extract_first(),
                'description': self.cleanHtml(' & '.join(skills.css('div.skill-description p').extract()).strip()),
                'img_link': skills.css('div.skill-details a span.d3-icon::attr(style)').extract_first(),
            } 

    def parse_skills_active(self, response):
        #folow links to specific class page
        for href in response.css('div.table-skills div.skill-details a::attr(href)').extract():
            yield scrapy.Request(response.urljoin(href),
                                 callback=self.parse_skill_active)

        # class_name = response.css('h2.header-2 a::text').extract_first()
        # for skills in response.css('div.table-skills tbody tr'):
        #     yield {
        #         'class_name': class_name,
        #         'name': skills.css('td.column-skill h3.subheader-3 a::text').extract_first(),
        #         'spell': 'active',
        #         'level': skills.css('td.column-level h3.subheader-3::text').extract_first(),
        #         'category': skills.css('div.skill-details div.skill-category::text').extract_first(),
        #         'description': self.cleanHtml(' & '.join(skills.css('div.skill-description p').extract()).strip()), 
        #         'nom_rune': skills.css('li.d3-color-rune span.tip::text').extract(),
        #         'img_link': skills.css('div.skill-details a span.d3-icon::attr(style)').extract_first(),
        #     }

        

    def parse_skill_active(self, response):
        class_name = response.css('h2.header-2 a::text').extract_first()
        name = response.css('div.skill-detail h2.subheader-2::text').extract_first()
        level = response.css('span.detail-level-unlock::text').extract_first()
        category = response.css('div.skill-detail div.skill-category a::text').extract_first()
        description = self.cleanHtml(' & '.join(response.css('div.skill-desc p').extract()).strip())
        img_link = response.css('div.skill-detail span.d3-icon::attr(style)').extract_first()

        for skills in response.css('div.rune-variants tbody'):
            yield {
                'class_name': class_name,
                'name': name,
                'spell': 'active',
                'level': level,
                'category': category,
                'description': description,
                'runes': self.createRunesArray('&'.join(skills.css('tr').extract()).strip()),
                'img_link': img_link,
            }