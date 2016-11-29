#!/bin/bash

#Script d'encodage unicode
#Visit http://www.utf8-chartable.de/ for adding option
#C/C++/Java source code enconding style

#0-Init:
echo -e "this program parse unicode (written in C/C++/Java/Python unicode style) into utf8 matching value"
if [ $1 ]
    then
        FILE=$1;
    else
        echo -e "Error, no arg provided. Expected syntax:\n./encodeUtf FILE[String]"
        exit 1
fi
if [ $2 ]
    then
        echo -e "Error, more than one args provided. Expected syntax:\n./encodeUtf FILE[String]"
        exit 1
fi
if [ ! -e $FILE ]
    then
        echo -e "Error, the file provided doesn't exist, please make sur you give the right location to access the file"
        exit 1
fi

confirm=""
echo -e "Are you sure you want to parse the file $FILE ? (the program will overwrite the file with no possible backup, if you're not sure please make a copy of it before the parse) (Y/N)\n"
read confirm

until [ $confirm = "Y" ] || [ $confirm = "N" ]
do
    echo -e "Cette réponse n'est pas possible, veuillez répondre \"Y\" pour oui ou \"N\" pour non.\n"
    echo -e "Are you sure you want to parse the file $FILE ? (the program will overwrite the file with no possible backup, if you're not sure please make a copy of it before the parse) (Y/N)\n"
    read confirm
done

if [ $confirm = "N" ]
    then     
        echo -e "Script terminated with no change by user choice."
        exit 0
fi
#---------------------------------------------------------

#1-Parsing
#---------------------------------------------------------
#Paragraphe
echo -e "Parsing des caractères de paragraphe (écris en dure et non actif):"
sed -i -e "s@\\\u00a0@@g" $FILE
sed -i -e "s@\\\n@@g" $FILE
sed -i -e "s@\\\t@@g" $FILE
sed -i -e "s@\\\r@@g" $FILE
sed -i -e "s@  @ @g" $FILE
sed -i '/^$/d' $FILE

echo -e "caractères parsés: \\n \\n \\t \\r espaceInsecable doubleEspace ligneVide"

#Accent Majuscule
echo -e "Parsing des accents et cédilles majuscules:"
sed -i -e "s@\\\u00c9@É@g" $FILE
sed -i -e "s@\\\u00c8@È@g" $FILE
sed -i -e "s@\\\u00ca@Ê@g" $FILE
sed -i -e "s@\\\u00cb@Ë@g" $FILE
sed -i -e "s@\\\u00c0@À@g" $FILE
sed -i -e "s@\\\u00c7@Ç@g" $FILE
sed -i -e "s@\\\u00c2@Â@g" $FILE
sed -i -e "s@\\\u0152@Œ@g" $FILE
echo -e "caractères parsés: É È Ê Ë À Ç Â Œ "

echo -e "Parsing des accents et cédilles minuscules:"
sed -i -e "s@\\\u00e9@é@g" $FILE
sed -i -e "s@\\\u00e8@è@g" $FILE
sed -i -e "s@\\\u00ea@ê@g" $FILE
sed -i -e "s@\\\u00eb@ë@g" $FILE
sed -i -e "s@\\\u00e0@à@g" $FILE
sed -i -e "s@\\\u00e7@ç@g" $FILE
sed -i -e "s@\\\u00f9@ù@g" $FILE
sed -i -e "s@\\\u0153@œ@g" $FILE
sed -i -e "s@\\\u00e2@â@g" $FILE
sed -i -e "s@\\\u00f4@ô@g" $FILE
sed -i -e "s@\\\u00fb@û@g" $FILE
sed -i -e "s@\\\u00ee@î@g" $FILE
sed -i -e "s@\\\u00ef@ï@g" $FILE
sed -i -e "s@\\\u00f6@ö@g" $FILE
echo -e "caractères parsés: é è ê ë à ç ù œ â ô û î ï ö"

echo -e "Parsing des accents des caractères de ponctuation (non prise en compte de \", @, etc.):"
sed -i -e "s@\\\u2013@-@g" $FILE
sed -i -e "s@\\\u002c@,@g" $FILE
sed -i -e "s@\\\u2019@'@g" $FILE
sed -i -e "s@\\\u003a@:@g" $FILE
sed -i -e "s@\\\u003b@;@g" $FILE
sed -i -e "s@\\\u0021@!@g" $FILE
sed -i -e "s@\\\u003f@?@g" $FILE
sed -i -e "s@\\\u0028@(@g" $FILE
sed -i -e "s@\\\u0029@)@g" $FILE
sed -i -e "s@\\\u002f@/@g" $FILE
sed -i -e "s@\\\u002b@+@g" $FILE
sed -i -e "s@\\\u002a@*@g" $FILE
sed -i -e "s@\\\u003c@<@g" $FILE
sed -i -e "s@\\\u003e@>@g" $FILE
sed -i -e "s@\\\u003d@=@g" $FILE
sed -i -e "s@\\\u0025@%@g" $FILE
echo -e "caractères parsés: - , ' : ; ! ? ( ) / + * = < > %"

#end:
echo -e "\n------------\nThe programm successfuly parse the file: $FILE"
exit 0
#---------------------------------------------------------

sed -e ':a' -e 'N' -e '$!ba' -e 's/\n/ /g'