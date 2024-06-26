import { expect, test } from 'vitest'
import {getDashed} from '../util/sudoku'
import Mine from '../util/mine';


let mine = new Mine(30,16,1);
mine.build([0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);


test('右边缘 29',()=>{
    expect(mine.getAround(29)).toStrictEqual([28,58,59])
})

test('右边缘 59',()=>{
    expect(mine.getAround(59)).toStrictEqual([28,29,58,88,89])
})
test('右边缘 479',()=>{
    expect(mine.getAround(479)).toStrictEqual([448,449,478])
})
test('左边缘 0',()=>{
    expect(mine.getAround(0)).toStrictEqual([1,30,31])
})

test('左边缘 30',()=>{
    expect(mine.getAround(30)).toStrictEqual([0,1,31,60,61])
})

test('36',()=>{
    expect(mine.getAround(36)).toStrictEqual([5,6,7,35,37,65,66,67])

    mine.build([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
})


// test('0 1 10',()=>{
//     let out = getDashed([0,1,10]);
//     console.log('out',JSON.stringify(out))
//     expect(out).toEqual(
//         {
//             "row": [
//                 {
//                     "top": [
//                         {
//                             "begin": 0,
//                             "data": [
//                                 0,
//                                 1
//                             ],
//                             "end": 1
//                         }
//                     ],
//                     "bottom": [
//                         {
//                             "begin": 0,
//                             "data": [
//                                 0
//                             ],
//                             "moreRight": true
//                         }
//                     ]
//                 },
//                 {
//                     "top": [],
//                     "bottom": [
//                         {
//                             "begin": 10,
//                             "data": [
//                                 10
//                             ]
//                         }
//                     ]
//                 }
//             ],
//             "col": [
//                 {
//                     "left": [
//                         {
//                             "begin": 0,
//                             "data": [
//                                 0
//                             ]
//                         }
//                     ],
//                     "right": []
//                 },
//                 {
//                     "left": [
//                         {
//                             "begin": 10,
//                             "data": [
//                                 10
//                             ],
//                             "moreTop": true
//                         }
//                     ],
//                     "right": [
//                         {
//                             "begin": 1,
//                             "data": [
//                                 1,
//                                 10
//                             ],
//                             "end": 10
//                         }
//                     ]
//                 }
//             ]
//         }
//     );
// })

test('1 9 10 11 19',()=>{
    let out = getDashed([1, 9, 10, 11, 19]);
    console.log('out',JSON.stringify(out))

    expect(out).toEqual(

        {
            row:[
                {
                    top:[
                        {begin:1,data:[1],end:1}
                    ]
                },
                {
                    top:[
                        {begin:9,data:[9],end:9,moreRight:true},
                        {begin:11,data:[11],end:11,moreLeft:true}
                    ],
                    bottom:[
                        {begin:9,data:[9],end:9,moreRight:true},
                        {begin:11,data:[11],end:11,moreLeft:true}
                    ]
                },
                {
                    bottom:[
                        {begin:19,data:[19],end:19}
                    ]
                }
            ],

            col:[
                {
                    left:[
                      {begin:9,data:[9],end:9}
                    ]
                },
                {
                    left:[
                        {begin:1,data:[1],end:1,moreBottom:true},
                        {begin:19,data:[19],end:19,moreTop:true}
                    ],
                    right:[
                        {begin:1,data:[1],end:1,moreBottom:true},
                        {begin:19,data:[19],end:19,moreTop:true}
                    ]
                },
                {
                    right:[
                        {begin:11,data:[11],end:11}
                    ]
                }
            ]
    
    }

    );
})


test('57,66,75,76',()=>{
    let out = getDashed([57,66,75,76]);
    console.log('out',JSON.stringify(out))

    expect(out).toEqual(

        {
            row:[
                {
                    top:[
                        {begin:57,data:[57],end:57}
                    ]
                },
                {
                    top:[
                        {begin:76,data:[76],end:76,moreLeft:true},
                    ],
                    bottom:[
                        {begin:75,data:[75,76],end:76},
                    ]
                },
            ],

            col:[
                {
                    left:[
                      {begin:57,data:[57,66,75],end:75}
                    ],
                    right:[
                        {begin:57,data:[57,66],end:66,moreBottom:true}
                    ]
                },
                {
                    right:[
                        {begin:76,data:[76],end:76},
                    ]
                },
                
            ]
    
    }

    );
})

// [[0,1,10],[9],[27,28,29,36,37,38],[63,72],[18,19],[45,46],[54,55],[73,74],[2,11,20],[56,64,65],[3,12,21,30],[47,48,49],[57,66,75,76],[4,5,6],[39,40],[58,67],[13,14],[22,23],[41,50],[59,68],[15,16],[24,25,34],[31,32,33],[42,43,51,52],[60,69,70],[77,78],[7,8,17],[61],[79],[26,35],[44,53,62],[71,80]]

// test('9',()=>{
//     let out = getDashed([9]);
//     expect(out).toEqual(

//         {row:[
//             {top:[ [ 9 ] ],bottom:[[9]]},
//         ],
//         col:[
//             {left:[[9]],right:[[9]]}

//         ]
    
//     }

//     );
// })

// test('27,28,29,36,37,38',()=>{
//     let out = getDashed([27,
//         28,
//         29,
//         36,
//         37,
//         38]);
//     expect(out).toEqual(

//         {row:[
//             {top:[ [ 27,28,29 ] ]},
//             {bottom:[[36,37,38]]}
//         ],
//         col:[
//             {left:[[27,36]]},
//             {right:[[29,38]]}
//         ]
    
//     }

//     );
// })

// test('63,72',()=>{
//     let out = getDashed([63,72]);
//     expect(out).toEqual(

//         {row:[
//             {top:[ [63 ] ]},
//             {bottom:[[72]]}
//         ],
//         col:[
//             {left:[[63,72]],right:[[63,72]]},
//         ]
    
//     }

//     );
// })

// test('18,19',()=>{
//     let out = getDashed([18,19]);
//     expect(out).toEqual(

//         {row:[
//             {top:[ [18,19 ] ],bottom:[[18,19]]},
//         ],
//         col:[
//             {left:[[18]]},
//             {right:[[19]]}
//         ]
    
//     }

//     );
// })


// test('2 11 20',()=>{
//     let out = getDashed([2,11,20]);
//     console.log('out',JSON.stringify(out))
//     expect(out).toEqual(

//         {row:[
//             {top:[ [2 ] ]},
//             {bottom:[[20]]}
//         ],
//         col:[
//             {left:[[2,11,20]],right:[[2,11,20]]},

//         ]
    
//     }

//     );
// })

// test('56 64 65',()=>{
//     let out = getDashed([56,64,65]);
//     console.log('out',JSON.stringify(out))
//     expect(out).toEqual(

//         {row:[
//             {top:[ [56 ] ]},
//             {top:[[64]],bottom:[[64,65]]}
//         ],
//         col:[
//             {left:[[64]]},
//             {left:[[56]],right:[[56,65]]}

//         ]
    
//     }

//     );
// })