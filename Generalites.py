import datetime
from Esprit_national import *

DATE = datetime.date(1950, 1, 1)

class generalites():
    def __init__(self):
        self.nom = ""                                                   #String
        self.esprits_nationaux = []                                     #Liste
        self.esprits_nationaux_termines = []

    def set_nom(self, nom):
        self.nom = nom                                                  #String

    def add_esprit_national(self, nom, description, date_expiration, effets):
        self.esprits_nationaux.append(esprit_national(nom, description, date_expiration, effets))
        self.esprits_nationaux.sort(key=lambda x:x.get_date_expiration())

    def show_esprits(self):
        for esprit in self.esprits_nationaux:
            print(esprit)

    def show_esprits_termines(self):
        for esprit in self.esprits_nationaux_termines:
            print(esprit)

    def update(self):
        while self.esprits_nationaux[0].get_date_expiration() < DATE:
            self.esprits_nationaux_termines.append(self.esprits_nationaux.pop(0))
