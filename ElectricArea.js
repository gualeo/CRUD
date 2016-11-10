//La función ValidarZona sirve para validar que las coordenadas a trabajar se encuentren dentro de una zona de cercanía a las líneas eléctricas.
// NOTE: Es necesario que el arreglo "Puntos" traiga las coordenadas en forma de Arreglo, donde el primer elemento del arreglo de coordenada será la latitud y el segundo la longitud.
// LEOB: Se modifica la funcion para que valide un unico punto.
this.ValidarZona=function(Puntos)
{

//Ejemplo de Validación (exclusivo uso interno)
//var Puntos = [[-36,-72],[-37,-73],[-38,-72.5],[38,73],[-39.5,-72],[-39,-72]];

// NOTE: Por uso del archivo KML, la última coordenada usada en el arreglo es la misma que la primera, solo para cerrar el poligono.
//Coordenadas del área de cercanía a las líneas eléctricas nombrada como "Área General"
//console.log(Puntos);

var Area = [
  [-74.01976899399661, -39.45273172007008],
  [-70.32609109871292, -39.25184244119748],
  [-71.4169959508928, -36.66549645661613],
  [-73.78344305764337, -36.27554821745849],
  [-74.01976899399661, -39.45273172007008]
];

//console.log(Puntos.length);

//Se validará cada una de las coordenadas obtenidas para saber si se encuentran cerca de las lineas eléctrica.
//for(var i = 0; i < Puntos.length; i++)
//{
var Validacion = [false, false, false, false, false, false, false, false, false];

  //Estas seis primeras comparaciones servirán para delimitar un área de cercanía llamada "Área General".
Validacion[0] = Puntos[0] >= ((Area[1][1] - Area[0][1]) / (Area[1][0] - Area[0][0])) * (Puntos[1] - Area[0][0]) + Area[0][1];
Validacion[1] = Puntos[0] <= ((Area[2][1] - Area[1][1]) / (Area[2][0] - Area[1][0])) * (Puntos[1] - Area[1][0]) + Area[1][1];
Validacion[2] = Puntos[0] <= ((Area[3][1] - Area[2][1]) / (Area[3][0] - Area[2][0])) * (Puntos[1] - Area[2][0]) + Area[2][1];
Validacion[3] = Puntos[0] <= ((Area[4][1] - Area[3][1]) / (Area[4][0] - Area[3][0])) * (Puntos[1] - Area[3][0]) + Area[3][1];

//Validación de la coordenada dentro del Área General de las lineas eléctricas
var x = Validacion[0]&&Validacion[1]&&Validacion[2]&&Validacion[3];

//Si la Variable se encuentra dentro del Área General quiere decir que es una coordenada que se encuentra cerca de las límeas eléctricas y por lo tanto tendrá el valor de true el último valor del arreglo.


//Ejemplo de Validación (exclusivo uso interno):
//console.log(Puntos[i]);
//}

//Ejemplo de Validación (exclusivo uso interno):
//console.log(Puntos);

//se retorna el mismo arreglo con la modificación que se agrego un elemento booleano a cada coordenada, siendo valor True cuando se encuentra cerca de la zona de líneas eléctricas.
return (x);
}
