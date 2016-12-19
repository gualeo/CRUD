//La función ValidarZona sirve para identificar cuál Estación Climatológica le corresponde de acuerdo a la zonas de estas.
// NOTE: Es necesario que el arreglo "Puntos" traiga las coordenadas en forma de Arreglo, donde el primer elemento del arreglo de coordenada será la latitud y el segundo la longitud.
this.Estaciones=function(Puntos)
{

  var EstElectrica = 0;

//Ejemplo de Validación (exclusivo uso interno) Solución: Regiones = [1,2,3,4,5,2,0,1,2]
  //var Puntos = [  [-35.37777777777778,-71.60111111111111],
  //                [-36.62083333333334,-72.3625],
  //                [-36.90361111111111,-71.41],
  //                [-38.455,-71.36194444444443],
  //                [-38.93444444444444,-72.65333333333334],
  //                [-37.7479555555556,-72.0487833333333],
  //                [-37,-70],
  //                [-36.2972222222222,-72.6409194444444],
  //                [-36.3157027777778,-71.75715]
  //              ];

  // NOTE: Por uso del archivo KML, la última coordenada usada en el arreglo es la misma que la primera, solo para cerrar el poligono.
  //Coordenadas de las áreas de las estaciones climatológicas. El último elemento del arreglo "Areas" corresponde a la identificación de las estaciones climatológicas.

                  //  ====================================
                  //
                  //    0 ===> Fuera de las zonas de estaciones climatológicas http://api.wunderground.com/api/ac6084d23fcb0ad4/history_20161218/q/zmw:00000.1.85682.json
                  //    1 ===> Panguilemo  http://api.wunderground.com/api/ac6084d23fcb0ad4/history_20161218/q/zmw:00000.248.85629.json
                  //    2 ===> Chillan Quinchamali http://api.wunderground.com/api/ac6084d23fcb0ad4/history_20161218/q/zmw:00000.1.85672.json   
                  //    3 ===> Termas de Chillan http://api.wunderground.com/api/ac6084d23fcb0ad4/history_20161218/q/zmw:00000.28.85672.json
                  //    4 ===> Lonquimay http://api.wunderground.com/api/ac6084d23fcb0ad4/history_20161218/q/zmw:00000.79.85743.json
                  //    5 ===> La Araucania http://api.wunderground.com/api/ac6084d23fcb0ad4/history_20161218/q/zmw:00000.1.85743.json
                  //
                  //  ====================================

  var Areas =
  [
    [ [-73.19793438703037,-36.29168004621116],
      [-70.82529946073481,-36.32235994438026],
      [-70.19155309788485,-34.20285613345067],
      [-71.90960393899721,-33.89543735358585],
      [-73.19793438703037,-36.29168004621116],1],

    [ [-73.77325278984959,-36.27001521895725],
      [-73.69616522910731,-37.69787393355154],
      [-72.04561512805283,-37.74888675044299],
      [-71.75679435549917,-36.31552166103609],
      [-73.77325278984959,-36.27001521895725],2],

    [ [-72.04509908630178,-37.73932455232174],
      [-71.02885546156512,-37.78361072177314],
      [-70.81341175331434,-36.31857747706286],
      [-71.75735781604116,-36.31562926011645],
      [-72.04509908630178,-37.73932455232174],3],

    [ [-72.05022548613637,-37.73719191547703],
      [-71.95065499098199,-39.31049663340983],
      [-70.93935253142955,-39.21299771696227],
      [-71.01830931065628,-37.78081982259041],
      [-72.05022548613637,-37.73719191547703],4],

    [ [-73.6903301449219,-37.69565220387725],
      [-73.59261975776961,-39.46530609129742],
      [-71.94638124282422,-39.31440048601065],
      [-72.04793531366487,-37.74681773462327],
      [-73.6903301449219,-37.69565220387725],5]
  ];

  //Se validará cada una de las coordenadas obtenidas para saber si se encuentran cerca de las lineas eléctrica.
  //for(var i = 0; i < Puntos.length; i++)
  //{
    var Validacion = [false, false, false, false];
    var x = [false, false, false, false,false];
    var y = false;
    var z = Puntos.length; //Servirá para saber si no se sobreescribio algún punto por estar intersección entre dos zonas
    console.log(Puntos);

      for(var j = 0; j <= 4; j++)
      {
        //Estas seis primeras comparaciones servirán para identificar en qué zona de Estación Climatológica se encuentra cada punto.

        Validacion = [false, false, false, false];
        Validacion[0] = Puntos[0] >= ((Areas[j][1][1] - Areas[j][0][1]) / (Areas[j][1][0] - Areas[j][0][0])) * (Puntos[1] - Areas[j][0][0]) + Areas[j][0][1];
        Validacion[1] = Puntos[0] >= ((Areas[j][2][1] - Areas[j][1][1]) / (Areas[j][2][0] - Areas[j][1][0])) * (Puntos[1] - Areas[j][1][0]) + Areas[j][1][1];

        //Se agrega este if, porque las coordenadas de la zona 2 no obedece el parametro de desigualdades como el caso anterior.
        if(j!=1)
        {
          Validacion[2] = Puntos[0] <= ((Areas[j][3][1] - Areas[j][2][1]) / (Areas[j][3][0] - Areas[j][2][0])) * (Puntos[1] - Areas[j][2][0]) + Areas[j][2][1];
        }
        else
        {
          Validacion[2] = Puntos[0] >= ((Areas[j][3][1] - Areas[j][2][1]) / (Areas[j][3][0] - Areas[j][2][0])) * (Puntos[1] - Areas[j][2][0]) + Areas[j][2][1];
        }

        Validacion[3] = Puntos[0] <= ((Areas[j][4][1] - Areas[j][3][1]) / (Areas[j][4][0] - Areas[j][3][0])) * (Puntos[1] - Areas[j][3][0]) + Areas[j][3][1];

        //Validación de la coordenada dentro del de la zona de la Estación Climatológica.
        x[j] = Validacion[0] && Validacion[1] && Validacion[2] && Validacion[3];
      }

  // NOTE: Si el punto no se encuentra en alguna zona de estación climatológica se agregará al arreglo del punto analizado el valor de 0 y se definirá como fuera de éstas.

      y = x[0] || x[1] || x[2] || x[3] || x[4];

      if (!y)
      {
        EstElectrica = 0;
      }

  // Posteriormente se pasará a analizar los que si se encuentran en alguna zona de estación climatológica. De acuerdo a la validación anterior, se agregará un número al arreglo siguiendo los siguientes valores:

  //  ====================================
  //
  //    0 ===> Fuera de las zonas de estaciones climatológicas
  //    1 ===> Panguilemo
  //    2 ===> Chillan Quinchamali
  //    3 ===> Termas de Chillan
  //    4 ===> Lonquimay
  //    5 ===> La Araucania
  //
  //  ====================================

      for(var j = 0; j <= 4; j++)
      {
        if (x[j])
        {
          EstElectrica = j+1;
          //Puntos[i].push(j+1);
        }
      }

  //Ejemplo de Validación (exclusivo uso interno):
  //console.log(Puntos[i]);

/*
  //Se borrarán los elmentos agregados de más si se sobreescribio algún punto por estar intersección entre dos zonas

    var a = (Puntos[i].length - (z+1));

    if (a!=0)
    {
      for(var j = 1; j <= a; j++)
      {
        Puntos[i].pop();
      }
    }*/
    //Ejemplo de Validación (exclusivo uso interno):
    //console.log(Puntos[i]);
  //}

  //Ejemplo de Validación (exclusivo uso interno):
  //console.log(Puntos);

//se retorna el mismo arreglo con la modificación que se agrego un elemento booleano a cada coordenada, siendo valor True cuando se encuentra cerca de la zona de líneas eléctricas.
return (EstElectrica);
}
