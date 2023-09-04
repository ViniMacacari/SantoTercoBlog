const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin'
const jwtSecret = process.env.JWT_SECRET


// Checar login (token de cookie)

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({ message: 'Acesso negado' })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId;
        next();
    } catch (error){
        return res.status(401).json({ message: 'Acesso negado' })
    }
};



// GET Pagina de login (admin apenas)
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodJs, Express & MongoDB"
        }
    

        const data = await Post.find();
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
} );

// POST Checar login

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne ({ username });

        if(!user) {
            return res.status(401).json({ message: 'Credenciais inválidas' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas' })
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret )
        res.cookie('token', token, {httpOnly: true})

        res.redirect('/dashboard')

    } catch (error) {
        console.log(error);
    }
} );


// POST Registrar

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const user = await User.create({ username, password:hashedPassword })
            res.status(201).json({massege: 'Usuário Criado', user})
        } catch (error) {
            if(error.code == 11000) {
                res.status(409).json({message: 'User já existe!'})
            }
            res.status(500).json({message: 'Erro no servidor'})
        }

    } catch (error) {
        console.log(error);
    }
} );

// Dashboard (checar login etc)

router.get('/dashboard', authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title: 'Dashboard',
            description: 'Dashboard do site'
        }

        const data = await Post.find();

        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error)
    }
});

// GET - Admin criar post



router.get('/add-post', authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title: 'Novo Post',
            description: 'Adicionar posts'
        }

        const data = await Post.find();

        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error)
    }
});



//  POST - Criar novo post

router.post('/add-post', authMiddleware, async (req, res) => {
    
    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard')
        } catch (error) {
            console.log(error)
        }

        res. redirect('/dashboard')
    } catch (error) {
        console.log(error)
    }
});

// get - editar post


router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    
    try {
        const locals = {
            title: "Editar Post",
            description: "Editar Post"
        };

        const data = await Post.findOne({ _id: req.params.id})

        res.render('admin/edit-post',{
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
});



// Post - Editar

router.post('/edit-post/:id', authMiddleware, async (req, res) => {
    
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updateAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`)
    } catch (error) {
        console.log(error)
    }
});


// excluir post

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }

});


// Logout

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin');
})





module.exports = router;








//BACKUP//
// router.post('/admin', async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         if(req.body.username === 'admin' && req.body.password === 'password') {
//             res.send('Você está logado!')
//         } else {
//             res.send('Você não conseguiu se logar! Verifique seu e-mail e senha.')
//         }
//     } catch (error) {
//         console.log(error);
//     }
// } );