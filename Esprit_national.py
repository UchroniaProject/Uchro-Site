import datetime

class esprit_national():
    def __init__(self, nom, description, date_expiration, effets):
        self.nom = nom                                                  #String
        self.description = description                                  #String
        self.date_expiration = date_expiration                          #datetime.date
        self.effets = effets                                            #Liste

    def __str__(self):
        return f"""{self.nom} : {self.description}
        {self.date_expiration.strftime("%d/%m/%Y")}
        {self.effets}"""

    def get_date_expiration(self):
        return self.date_expiration