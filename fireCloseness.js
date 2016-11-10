//La función IncendioCercano sirve para saber si uno de nuestras coordenadas de incendio se encuentra dentro del radio de 500 m de alguna linea eléctica de interés.
// NOTE: Es necesario que el arreglo "Puntos" traiga las coordenadas en forma de Arreglo, donde el primer elemento del arreglo de coordenada será la latitud y el segundo la longitud.
// NOTE: Es necesario que el arreglo "Lineas" sea un archivo extraido del excel o javascript desarrollado por el equipo, ya que debe traer las coordenadas en forma de Arreglo acompañados del tipo de posición de los puntos.
// donde el primer elemento debe ser el tipo de posición seguido de la latitud y longitud de los cuatro puntos del área alrededor de cada linea.



this.IncendioCercano=function(Puntos, Lineas)
{

  //console.log(Puntos);
  //console.log(Lineas);

//Ejemplo de validación (exclusivo uso interno)
//var Puntos = [[0,0],[-10,10],[3,4],[-1,-5.5]];
//var Lineas = [
//  [1, -5.0, -2.5, -1.0, -5.5, 4.0, 9.5, 8.0, 6.5],
//  [2, 1.0, 5.5, 5.0, 2.50, -8.0, -6.5, -4., -9.5],
//  [3, -8.0, 6.5, -4.0, 9.5, 1.0, -5.5, 5.0, -2.5],
//  [4, 4.0, -9.5, 8.0, -6.5, -5.0, 2.5, -1.0, 5.5],
//];

//Ejemplo de validación (exclusivo uso interno):
//console.log(Puntos.length);


//Se validará cada una de las coordenadas obtenidas para saber si se encuentran cerca de alguna linea electrica lineas eléctrica.
//
//for(var i = 0; i < 1000; i++)
//for(var i = 0; i < Puntos.length; i++)
//{

  //if (Puntos[i][13] == true){
    var Count = 0;
    var estaCerca = false;

    //Se clasificarán en 4 diferetnes zonas las áreas proporcionadas
    for(var j = 0; j < Lineas.length; j++)
    //for(var j = 9656; j < 9658; j++)
    {
      


      var Validacion = [false, false, false, false];

      //Estas cuatro primeras comparaciones servirán para delimitar un área de cercanía a la linea electrica.
      if ((Lineas[j][0] == 1)||(Lineas[j][0] == 3)) {
        //console.log('entre al 1 y 3');
        Validacion[0] = Puntos[0] >= ((Lineas[j][3] - Lineas[j][1]) / (Lineas[j][4] - Lineas[j][2])) * (Puntos[1] - Lineas[j][2]) + Lineas[j][1];
        Validacion[1] = Puntos[0] >= ((Lineas[j][5] - Lineas[j][1]) / (Lineas[j][6] - Lineas[j][2])) * (Puntos[1] - Lineas[j][2]) + Lineas[j][1];
        Validacion[2] = Puntos[0] <= ((Lineas[j][5] - Lineas[j][7]) / (Lineas[j][6] - Lineas[j][8])) * (Puntos[1] - Lineas[j][8]) + Lineas[j][7];
        Validacion[3] = Puntos[0] <= ((Lineas[j][3] - Lineas[j][7]) / (Lineas[j][4] - Lineas[j][8])) * (Puntos[1] - Lineas[j][8]) + Lineas[j][7];
      }

      if ((Lineas[j][0] == 2)||(Lineas[j][0] == 4)) {
        //console.log('entre al 2 y 4');
        Validacion[0] = Puntos[0] <= ((Lineas[j][3] - Lineas[j][1]) / (Lineas[j][4] - Lineas[j][2])) * (Puntos[1] - Lineas[j][2]) + Lineas[j][1];
        Validacion[1] = Puntos[0] >= ((Lineas[j][5] - Lineas[j][1]) / (Lineas[j][6] - Lineas[j][2])) * (Puntos[1] - Lineas[j][2]) + Lineas[j][1];
        Validacion[2] = Puntos[0] >= ((Lineas[j][5] - Lineas[j][7]) / (Lineas[j][6] - Lineas[j][8])) * (Puntos[1] - Lineas[j][8]) + Lineas[j][7];
        Validacion[3] = Puntos[0] <= ((Lineas[j][3] - Lineas[j][7]) / (Lineas[j][4] - Lineas[j][8])) * (Puntos[1] - Lineas[j][8]) + Lineas[j][7];
      }

      //Validación de la coordenada dentro del Área alrededor de una linea eléctrica.
      var x = Validacion[0]&&Validacion[1]&&Validacion[2]&&Validacion[3];

      //Ejemplo de validación (exclusivo uso interno):
      //console.log(Puntos[i][0] + "," + Puntos[i][1] + " + " + Validacion);

      //Si la coordenada trabajada se encuentra dentro del Área alrededor de una linea eléctrica sumará al contador.
      if (x) {
        Count++;
      }
      //Ejemplo de validación (exclusivo uso interno):
      //console.log(x);
      //console.log(Count);

    }

    //Si el contador tiene es mayor que cero es que hay un punto de incendio cerca de alguna linea electrica y se agregará el valor de "true" al último elementro del arreglo de la coordenada analizada
    if (Count>0) {
      estaCerca = true;

    }
    else {
      estaCerca = false;
    }

    //alert(Puntos[i]);

  

  //Ejemplo de validación (exclusivo uso interno):
  //console.log(Puntos[i]);


//Ejemplo de validación (exclusivo uso interno):
//console.log(Puntos);

//se retorna el mismo arreglo con la modificación que se agrego un elemento booleano a cada coordenada, siendo valor True cuando se encuentra cerca de la zona de líneas eléctricas.
return (estaCerca);
}