const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET / HOME
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Node Blog",
            description: "Simple Blog created with NodJs, Express & MongoDB"
        }

        let perPage = 6;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 }}])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
        
        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', { 
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: `/`
        });

    } catch (error) {
        console.log(error);
    }
} );

// GET / Post: id

router.get('/post/:id', async (req, res) => {
    try {

        let slug = req.params.id;

        const data = await Post.findById({_id: slug });

        const locals = {
            title: data.title,
            description: "Simple Blog created with NodJs, Express & MongoDB",
            currentRoute: `/post/${slug}`
        }

        res.render('post', { locals, data, currentRoute });
    } catch (error) {
        console.log(error);
    }
} );

// Post / Post: pesquisa

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Simple Blog created with NodJs, Express & MongoDB"
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "")
        
        const data = await Post.find({
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                {body: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
            ]
        });

        res.render("search", {
            data,
            locals
        });
    } catch (error) {
        console.log(error);
    }
} );



//-----------------------------------------------------------------------------------

// Router base:

// router.get('', async (req, res) => {
//     const locals = {
//         title: "Node Blog",
//         description: "Simple Blog created with NodJs, Express & MongoDB"
//     }

//     try {
//         const data = await Post.find();
//         res.render('index', { locals, data });
//     } catch (error) {
//         console.log(error);
//     }
// } );

//-----------------------------------------------------------------------------------

// Preencher bancos com infos
// function insertPostData () {
//     Post.insertMany([
//         {
//             title: "Building a Blog",
//             body: "This is the body text"
//         },
//         {
//             title: "Blog a building",
//             body: "This 2 is the body text"
//         },
//         {
//             title: "A building blog",
//             body: "This 3 is the body text"
//         },
//         {
//             title: "Blog building a",
//             body: "This 4 is the body text"
//         },
//         {
//             title: "Building blog a",
//             body: "This 5 is the body text"
//         },
//     ])
// }
// insertPostData(); -- Se tirar o comentario vai fazer com que essas infos entrem no banco

//-----------------------------------------------------------------------------------

router.get('/about', (req, res) => {
    res.render('about');
    currentRoute: `/about`
} );

module.exports = router;