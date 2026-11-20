

function dot_product(arr1, arr2){

    let res = 0
    for(let i = 0; i<arr1.length;i++){
        res += arr1[i]*arr2[i]

    }

    return res
}


function vec_mag(vec){

    let sum_squares = 0
    for(let i =0;i<vec.length;i++){
        sum_squares +=vec[i]**2

    }

    return Math.sqrt(sum_squares)
}



export function angle_vectors(v1, v2){

    return (Math.acos(dot_product(v1,v2) / (vec_mag(v1)*vec_mag(v2))))*(180/Math.PI)

}

