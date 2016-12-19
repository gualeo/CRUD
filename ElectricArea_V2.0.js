//*********************************************************************************************************************************************************************************************************************
//  Versión 1.0 - Fernando Tenorio: Se crea la función de ElectricArea para depurar las coordenadas adquiridas de los satélites. Se dejarán las coordenadas que se encuentran en el área de SAESA orginalmente.
//  Versión 2.0 - Fernando Tenorio: Se agregarán más áreas de referencia y se clasificaran los puntos de incendio con base en estas.
//
//*********************************************************************************************************************************************************************************************************************

//La función ValidarZona sirve para validar que las coordenadas a trabajar se encuentren dentro de una zona de cercanía a las líneas eléctricas.
// NOTE: Es necesario que la variable "Punto" debe ser un Arreglo, donde el primer elemento será la latitud y el segundo la longitud.
// LEOB: Se modifica la funcion para que valide un unico punto.

this.ValidarZona=function(Punto)
{

//Ejemplo de Validación (exclusivo uso de pruebas)
//var Punto = [
//  [-70.60494324701844,-36.47815481660592],
//  [-71.89943587687516,-39.58802440413192],
//  [-71.01805505304141,-34.04907515739734],
//  [-70.96181000276812,-38.12674790860294],
//  [-71.71209167201283,-34.22550496502438],
//  [-71.11572861693884,-36.50161912512981],
//  [-73.19269716430362,-39.41777605270118],
//  [-71.02734075859991,-37.06571823748731],
//  [-71.24171120805569,-35.11591956901206],
//  [-71.77148698676481,-38.38387699865418],
//  [-71.70351349072075,-36.29230360929599],
//  [-71.76247599506573,-36.76120606093868],
// [-72.40448426980252,-37.60973320712886]
//];


// NOTE: Por uso del archivo KML, la última coordenada usada en el arreglo es la misma que la primera, solo para cerrar el poligono.
//Coordenadas del área de cercanía a las líneas eléctricas nombrada como "Área General"

//console.log(Punto); (exclusivo uso de pruebas)


//NOTE: Distribución del arreglo "Area":

    //  ====================================
    //
    //    0 ===> CGE_Zona01
    //    1 ===> CGE_Zona02
    //    2 ===> CGE_Zona03
    //    3 ===> Copelec
    //    4 ===> Frontel
    //    5 ===> SAESA
    //    6 ===> Transelec_Zona01
    //    7 ===> Transelec_Zona02
    //    8 ===> Transelec_Zona03
    //
    //  ====================================


var Area = [
  [ [-36.29146149577734, -73.18725070787799],
    [-36.32214876180121, -70.82240705527532],
    [-34.1987795736022, -70.1751130148872],
    [-33.89271017289524, -71.91016043360999],
    [-36.29146149577734, -73.18725070787799],0],

  [ [-37.19608537391944, -73.36044247531808],
    [-37.22100090106127, -72.79367457621397],
    [-36.29943594822857, -72.74638005423699],
    [-36.28617816192295, -73.34106837819658],
    [-37.19608537391944, -73.36044247531808],0],

  [ [-37.71200419895348, -72.73084928625299],
    [-37.77631673576813, -71.26651690794454],
    [-36.98184519217665, -71.22002565974698],
    [-36.9434170973128, -72.7929139896071],
    [-37.71200419895348, -72.73084928625299],1],

  [ [-36.92981090206442, -73.23695498728829],
    [-36.9887281230011, -71.06249168745013],
    [-36.30572404729543, -70.98631487651105],
    [-36.0077531426077, -73.16609328078323],
    [-36.92981090206442, -73.23695498728829],0],

  [ [-36.6127067696096, -73.75218856326055],
    [-39.45833158794815, -73.58579550461602],
    [-39.20552041176856, -70.94295586890083],
    [-36.70926492377895, -71.07696700668537],
    [-36.6127067696096, -73.75218856326055],0],

  [ [-36.50609855380412, -73.75608828892581],
    [-39.41675293656101, -73.57151097738444],
    [-39.18868171505012, -70.93438804316865],
    [-36.60561880271127, -71.00875615816318],
    [-36.50609855380412, -73.75608828892581],0],

  [ [-36.79053106787967, -71.86923849998577],
    [-36.79682331420828, -71.2555084202983],
    [-34.56178186469852, -70.82004997463903],
    [-34.60009979473158, -71.3787405072321],
    [-36.79053106787967, -71.86923849998577],0],

  [ [-37.12161414462222, -72.59528738079467],
    [-37.1786876251421, -71.3419254789732],
    [-36.7947837497287, -71.26907004855876],
    [-36.774222704086, -72.59632743217622],
    [-37.12161414462222, -72.59528738079467],1],

  [ [-38.75817066193013, -72.83785774474173],
    [-38.7704155754022, -72.28803113532271],
    [-37.14364270164018, -72.06514348338186],
    [-37.11910496669553, -72.59593854912187],
    [-38.75817066193013, -72.83785774474173],0],
];

//for (var j = 0; j < Punto.length; j++) (exclusivo uso de pruebas)
//{

var Zona = [false, false, false, false, false, false, false, false, false];

//Se validará cada una de las coordenadas obtenidas para saber si se encuentran cerca de las lineas eléctrica.
for(var i = 0; i < Area.length; i++)
{
  var Validacion = [false, false, false, false];

  //Estas seis primeras comparaciones servirán para delimitar un área de cercanía llamada "Área General".
  // Debido a la naturaleza de las áreas se clasificaron en dos formas.

  Validacion[0] = Punto[0] >= ((Area[i][1][0] - Area[i][0][0]) / (Area[i][1][1] - Area[i][0][1])) * (Punto[1] - Area[i][0][1]) + Area[i][0][0];
  Validacion[1] = Punto[0] >= ((Area[i][2][0] - Area[i][1][0]) / (Area[i][2][1] - Area[i][1][1])) * (Punto[1] - Area[i][1][1]) + Area[i][1][0];
  Validacion[2] = Punto[0] <= ((Area[i][3][0] - Area[i][2][0]) / (Area[i][3][1] - Area[i][2][1])) * (Punto[1] - Area[i][2][1]) + Area[i][2][0];

  if(Area[i][5]===0)
  {
    Validacion[3] = Punto[0] <= ((Area[i][4][0] - Area[i][3][0]) / (Area[i][4][1] - Area[i][3][1])) * (Punto[1] - Area[i][3][1]) + Area[i][3][0];
  }
  else
  {
    Validacion[3] = Punto[0] >= ((Area[i][4][0] - Area[i][3][0]) / (Area[i][4][1] - Area[i][3][1])) * (Punto[1] - Area[i][3][1]) + Area[i][3][0];
  }
  //Validación de la coordenada dentro del Área General de las lineas eléctricas
  Zona[i] = Validacion[0]&&Validacion[1]&&Validacion[2]&&Validacion[3];

  //Ejemplo de Validación (exclusivo uso de pruebas):
  //console.log("Zona " + i + ": " + Zona[i]);
}

var x = [(Zona[0]||Zona[1]||Zona[2]),Zona[3],Zona[4],Zona[5],(Zona[6]||Zona[7]||Zona[8])];

var val = Zona[0]||Zona[1]||Zona[2]||Zona[3]||Zona[4]||Zona[5]||Zona[6]||Zona[7]||Zona[8];
//Ejemplo de Validación (exclusivo uso de pruebas):
//console.log(x);
//}


//NOTE: Se retorna una arreglo de 5 elementos con valores booleanos todos. Si el elemento del arreglo es True quiere decir que el punto de incendio se encuentra en la zona de esa distribuidora.
// Los elemento del arreglo corresponden a las siguientes zonas:

//  ====================================
//
//    0 ===> CGE
//    1 ===> Copelec
//    2 ===> Frontel
//    3 ===> SAESA
//    4 ===> Transelec
//
//  ====================================

return ([val, x]);
}
