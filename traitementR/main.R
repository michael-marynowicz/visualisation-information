library(tidyverse)

# fonction permettant d'unifier les genres 
filterGenre <- function(x){
  x <- mutate(x,genre = str_replace(genre, ".*[rR]ock.*", "Rock")) %>%
    mutate(x,genre = str_replace(genre, ".*Rock.*", "Mika")) %>%
    mutate(x,genre = str_replace(genre, ".*[mM]etal.*", "Metal")) %>%
    mutate(x,genre = str_replace(genre, ".*[cC]ountry.*", "Country")) %>%
    mutate(x,genre = str_replace(genre, ".*Hip Hop.*", "Hip Hop")) %>%
    mutate(x,genre = str_replace(genre, ".*[pP]op.*", "Pop")) %>%
    mutate(x,genre = str_replace(genre, ".*Wave.*", "Wave")) %>%
    mutate(x,genre = str_replace(genre, ".*Electro.*", "Electro")) %>%
    mutate(x,genre = str_replace(genre, ".*[pP]unk.*", "Punk")) %>%
    mutate(x,genre = str_replace(genre, ".*[fF][oi]lk.*", "Folk")) %>%
    mutate(x,genre = str_replace(genre, ".*[jJ]azz.*", "Jazz")) %>%
    mutate(x,genre = str_replace(genre, ".*Visual Kei.*", "Visual Kei")) %>%
    mutate(x,genre = str_replace(genre, ".*Neue Deutsche.*", "Neue Deutsche")) %>%
    mutate(x,genre = str_replace(genre, ".*R&amp;B.*", "RandB"))
  
  
}
# lecture des fichier csv contenant toutes les données de la db
albums <- readRDS("/Users/maryno/Desktop/Visu/Project/Wasabi-dataset/albums_all_artists_3000.rds")

#creation du tableau avec le genre et le lieu correctement ecrit 
locationInfo <- albums %>% select(country,genre)

locationInfo <- filterGenre(locationInfo)

locationInfo <- mutate(locationInfo,genre = str_replace(genre, "Neue-Deutsche-H&#xE4;rte", "Neue Deutsche"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, "Neue Deutsche H&#xE4;rte", "Neue Deutsche"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, ".*Children'&apos;'s Music.*", "Children Music"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, "Children&apos;s Music", "Children Music"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, ".*Gothic Rock&#x200F;&#x200E;.*", "Gothic Rock"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, ".*Gothic Rock&#x200F;&#x200E;.*", "Gothic Rock"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, "Forr&#xF3;", "Forro"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, "Visual Kei&#x200E;", "Visual Kei"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, "Dark Wave&#x200F;&#x200E;", "Dark Wave"))
locationInfo <- mutate(locationInfo,genre = str_replace(genre, "Rock &apos;N&apos; Roll", "Rock And Roll"))



#genre par année
genreParAnnee <- locationInfo %>% select(country,genre) 
genreParAnnee <- genreParAnnee %>% mutate(albums %>% select(publicationDate))


locationInfo <- locationInfo %>% rename(countryCode = country)

# suppression des lignes contenant des données nulles

locationInfo <- locationInfo %>% replace(.=="NULL", "Inconnu")
locationInfo <- locationInfo %>% replace(.=="", "Inconnu")
locationInfo$countryCode <- locationInfo$countryCode %>% replace_na('Inconnu')

genreParAnnee <- genreParAnnee %>% replace(.=="NULL", "Inconnu")
genreParAnnee <- genreParAnnee %>% replace(.=="", "Inconnu")
genreParAnnee <- genreParAnnee %>% replace(.=="????", "Inconnu")


# on regroupe les albums qui ont le meme genre, qui sont sorti la même année et dans le meme pays
genreParAnnee <- genreParAnnee %>% group_by(country, genre, publicationDate) %>% summarise(count = n()) 



allLocation <- read.csv("~/Desktop/Visu/Project/Wasabi-dataset/country_lat_long.csv")
allLocation <- allLocation %>% rename(countryCode = ISO.3166.Country.Code,countryName = Country)
allLocation <- allLocation %>% mutate(countryCode = str_replace(countryCode, ".*PS.*", "XW"))

# merge de allLocation et de locationInfo pour avoir les données geographiques des pays
# les deux list ne contenaient pas les meme nombres de ligne donc cbind et left_join impossible
locationInfo <- merge(x = locationInfo, y = allLocation, by="countryCode", all.x = T)




locationInfo$countryName <- locationInfo$countryName %>% replace_na('Inconnu')
locationInfo <- locationInfo %>% select(countryCode,countryName,genre)


# creation d'une liste qui contiendra le classement des albums par genre
classement <- albums %>% select(name,title,genre,publicationDate,deezerFans,urlDeezer)
classement <- filterGenre(classement)
classement$genre <- classement$genre %>% replace_na('Inconnu')
classement$publicationDate <- classement$publicationDate %>% replace_na('Inconnu')

classement <- classement %>% mutate(locationInfo %>% select(countryCode,countryName))
classement <- classement %>% select(countryCode,countryName,everything())

classement$genre <- classement$genre %>% replace_na('Inconnu')


# on regroupe les lignes similaires et on crée une nouvelle colonne contenant la somme
locationInfo <- locationInfo %>% group_by(countryCode,countryName,genre) %>% summarise(count = n())

write.csv(locationInfo,"/Users/maryno/Desktop/Visu/Project/Wasabi-dataset/locationInfo.csv", row.names = FALSE)
write.csv(classement,"/Users/maryno/Desktop/Visu/Project/Wasabi-dataset/classement.csv", row.names = FALSE)
write.csv(genreParAnnee,"/Users/maryno/Desktop/Visu/Project/Wasabi-dataset/genreParAnnee.csv", row.names = FALSE)

