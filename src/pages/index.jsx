import { Button, Col, Container, Row } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import useInfo from '@/lib/swr-hooks/useInfo';
import prisma from '@/lib/db';
import RiiTagCarousel from '@/components/index/RiiTagCarousel';
import safeJsonStringify from 'safe-json-stringify';
import { Decimal } from 'decimal.js';

export async function getStaticProps() {
  const userCount = await prisma.user.count();
  const playCountResult = await prisma.$queryRaw`
      SELECT SUM(coins)
      FROM user
  `;
  const playCount = Number(playCountResult[0]['SUM(coins)']);
  const randomUsers = await prisma.$queryRaw`
      SELECT user.username, user.name_on_riitag, user.updated_at
      FROM user
      WHERE user.coins > 10
      ORDER BY RAND()
      LIMIT 5
  `;

  return {
    props: {
      userCount,
      playCount,
      randomUsers: JSON.parse(safeJsonStringify(randomUsers)),
    },
    revalidate: 10,
  };
}

function IndexPage({ userCount, playCount, randomUsers }) {
  const router = useRouter();

  const { user, isLoading } = useInfo();

  useEffect(() => {
    if (router.query.error) {
      window.history.replaceState(null, null, '/');
      toast.error(
        'There was an error while logging you in. Please try again later.'
      );
    }
  }, [router.query.error]);

  return (
    <Container>
      <NextSeo />
      <Row>
        <Col className="text-center">
          <h1>Welcome to RiiTag!</h1>
          <p className="mt-4">
            RiiTag is a customizable gamertag. By sharing your
            gamertag, you can show what you&apos;ve been
            playing to your friends! The tag
            updates on-the-fly. You need a Discord account in order to start
            using RiiTag. Covers are provided by{' '}
            <a href="https://gametdb.com/" target="_blank" rel="noreferrer">
              GameTDB
            </a>{' '}
            and this service is developed by{' '}
            <a href="https://rc24.xyz/" target="_blank" rel="noreferrer">
              RiiConnect24
            </a>
            .
          </p>
        </Col>
      </Row>

      {
        isLoading === false ? (
          <Row>
            <Col className="d-flex gap-1 flex-column flex-sm-row align-items-center justify-content-center">
              {user?.username === undefined && (
                <>
                  <form method="POST" action="/api/auth/login/discord">
                    <Button variant="success" size="lg" type="submit">
                      <FontAwesomeIcon className="me-2" icon={faDiscord} />
                      Login with Discord
                    </Button>
                  </form>{' '}
                </>
              )}
              <a
                href="https://wii.guide/riitag"
                target="_blank"
                rel="noreferrer noopener"
              >
                <Button size="lg">
                  <FontAwesomeIcon className="me-2" icon={faQuestionCircle} />
                  Instructions
                </Button>
              </a>
            </Col>
          </Row>
        ) : null
      }

      {
        isLoading === false && user?.username === undefined && (
          <Row className="mt-1">
            <Col>
              <p className="text-center">
                If an account does not exist, it will be created. You agree to our{' '}
                <Link href="/privacy-policy">Privacy Policy</Link> and our{' '}
                <Link href="tos">Terms of Service</Link>.
              </p>
            </Col>
          </Row>
        )
      }

      {
        userCount !== 0 && (
          <Row className="mt-2 text-center">
            <Col>
              <h3>
                Join {userCount}{' '}
                {userCount === 1 ? 'other gamer' : 'other gamers'} that have played games {playCount}{' '}
                {playCount === 1 ? 'time' : 'times'}!
              </h3>
            </Col>
          </Row>
        )
      }

      {
        randomUsers.length > 0 && (
          <Row className="text-center">
            <Col>
              <RiiTagCarousel randomUsers={randomUsers} />
            </Col>
          </Row>
        )
      }


      <Row>
        <h3 className="mt-4 text-center">
          Platforms Supported
        </h3>
        <Row className="mt-4">
          <Col>
            <h5 className="text-center">3DS</h5>
            <ul>
              <li>3DS-RPC Discord RPC</li>
              <li>Citra Discord RPC</li>
            </ul>
            <h5 className="text-center">Switch</h5>
            <ul>
              <li>NSO-RPC Discord RPC</li>
              <li>Ryujinx Discord RPC</li>
              <li>SwitchPresence-Rewritten Discord RPC</li>
              <li>Yuzu Discord RPC</li>
            </ul>
          </Col>
          <Col>
            <h5 className="text-center">Wii</h5>
            <ul>
              <li>Dolphin Discord RPC</li>
              <li>USB Loaders</li>
              <ul>
                <li>Configurable USB Loader</li>
                <li>USB Loader GX</li>
                <li>WiiFlow</li>
              </ul>
            </ul>
          </Col>
          <Col>
            <h5 className="text-center">Wii U</h5>
            <ul>
              <li>Aroma Plugin</li>
              <li>Cemu Discord RPC</li>
            </ul>
          </Col>
        </Row>
      </Row>
    </Container >
  );
}

IndexPage.propTypes = {
  userCount: PropTypes.number.isRequired,
  randomUsers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default IndexPage;
