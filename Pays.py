from Generalites import *

class Pays():
    def __init__(self):
        self.generalites = generalites()



if __name__ == '__main__':
    Anderland = Pays()
    Anderland.generalites.set_nom("Anderland")
    Anderland.generalites.add_esprit_national("Revanchard-1", "On veut se venger !", datetime.date(1948,1,1), ["Trucs"])
    Anderland.generalites.add_esprit_national("Revanchard0", "On veut se venger !", datetime.date(1949,1,1), ["Trucs"])
    Anderland.generalites.add_esprit_national("Revanchard1", "On veut se venger !", datetime.date(1950,1,1), ["Trucs"])
    Anderland.generalites.add_esprit_national("Revanchard2", "On veut se venger !", datetime.date(1950,6,1), ["Trucs"])
    Anderland.generalites.add_esprit_national("Revanchard3", "On veut se venger !", datetime.date(1954,2,1), ["Trucs"])
    Anderland.generalites.add_esprit_national("Revanchard4", "On veut se venger !", datetime.date(1953,3,1), ["Trucs"])
    Anderland.generalites.show_esprits()
    print()
    print()
    print()
    Anderland.generalites.update()
    Anderland.generalites.show_esprits()
